import { Injectable } from "@nestjs/common";
import { AppError } from "src/common/errors/app.error";
import { ERROR } from "src/common/errors/error.enum";
import { Model } from 'mongoose';
import { Post } from "src/module/post.schema";
import { User } from "src/module/user.schema";
import { Like } from "src/module/like.schema";
import { Comment } from "src/module/comment.schema";
import { InjectModel } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { buildCommentTree } from "src/utils/build-comment-tree";
import { PostResponse } from "src/dto/response/post.response.dto";
import { CreateUserRequestDto } from "src/dto/request/create-user.request.dto";
import { UpdateUserRequestDto } from "src/dto/request/update-user.request.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Post.name) private readonly postModel: Model<Post>,
        @InjectModel(Like.name) private readonly likeModel: Model<Like>,
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    ) { }
    async getAdminHome() {
        const listUser = await this.userModel.find();

        const results = await Promise.all(
            listUser.map(async (user) => {
                const [totalPosts, totalLikes, totalComments, totalShares] = await Promise.all([
                    this.postModel.countDocuments({ userId: user._id }),
                    this.likeModel.countDocuments({ userId: user._id }),
                    this.commentModel.countDocuments({ userId: user._id }),
                    this.postModel.countDocuments({ userId: user._id, originalPostId: { $ne: null } }),
                ]);

                return {
                    id: user._id,
                    name: user.name,
                    totalPosts,
                    totalLikes,
                    totalComments,
                    totalShares
                };
            })
        );

        return results;
    };

    async ensureUserExists(userId: string): Promise<User> {
        const user = await this.userModel.findById(userId);
        if (!user) throw new AppError(ERROR.USER_NOT_FOUND);
        return user;
    }

    async getAllPost(page: number, limit: number, userId: string) {
        await this.ensureUserExists(userId);
        const skip = (page - 1) * limit;
        const query: any = { deleted: false, userId: new mongoose.Types.ObjectId(userId) };
        const total = await this.postModel.countDocuments(query);

        const listResult = await this.postModel.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },

            // lookup like
            {
                $lookup: {
                    from: 'likes',
                    let: { postId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$postId', '$$postId'] }, { $eq: ['$deleted', false] }] } } },
                        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        { $project: { id: '$_id', 'user._id': 1, 'user.name': 1, 'user.avatar': 1, createdAt: 1 } }
                    ],
                    as: 'likes'
                }
            },
            { $addFields: { likeCount: { $size: '$likes' } } },

            // lookup comment
            {
                $lookup: {
                    from: 'comments',
                    let: { postId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$postId', '$$postId'] }, { $eq: ['$deleted', false] }] } } },
                        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                id: '$_id',
                                content: 1,
                                images: 1,
                                parentCommentId: 1,
                                postId: 1,
                                'user._id': 1,
                                'user.name': 1,
                                'user.avatar': 1,
                                createdAt: 1
                            }
                        }
                    ],
                    as: 'commentUsers'
                }
            },
            { $addFields: { commentCount: { $size: '$commentUsers' } } },

            // lookup rootPost
            {
                $lookup: {
                    from: 'posts',
                    let: { rootPostId: '$rootPostId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$rootPostId'] } } },
                        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        { $project: { id: '$_id', content: 1, images: 1, createdAt: 1, 'user._id': 1, 'user.name': 1, 'user.avatar': 1 } }
                    ],
                    as: 'rootPost'
                }
            },
            { $unwind: { path: '$rootPost', preserveNullAndEmptyArrays: true } },

            // share count
            {
                $lookup: {
                    from: 'posts',
                    let: { postId: '$_id', rootPostId: '$rootPostId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $cond: [
                                        { $eq: ['$$rootPostId', null] },
                                        { $eq: ['$rootPostId', '$$postId'] },
                                        { $eq: ['$originalPostId', '$$postId'] }
                                    ]
                                }
                            }
                        },
                        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        { $project: { id: '$_id', 'user._id': 1, 'user.name': 1, 'user.avatar': 1, createdAt: 1 } }
                    ],
                    as: 'shareUsers'
                }
            },
            { $addFields: { shareCount: { $size: '$shareUsers' } } },

            // get user
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    id: '$_id',
                    content: 1,
                    images: 1,
                    createdAt: 1,
                    'user._id': 1,
                    'user.name': 1,
                    'user.avatar': 1,
                    likeCount: 1,
                    likes: 1,
                    commentCount: 1,
                    commentUsers: 1,
                    shareUsers: 1,
                    shareCount: 1,
                    rootPost: 1,
                    originalPostId: 1,
                    rootPostId: 1
                }
            }
        ]);
        const resultWithTree = listResult.map(post => ({
            ...post,
            commentUsers: buildCommentTree(post.commentUsers || [])
        }));

        const listPostResult = resultWithTree.map(item => new PostResponse(item));

        return {
            total,
            listpost: listPostResult,
        }

    }

    // ========== USER MANAGEMENT METHODS ==========

    async createUser(createUserDto: CreateUserRequestDto) {
        // Kiểm tra email đã tồn tại
        const existingEmail = await this.userModel.findOne({ email: createUserDto.email });
        if (existingEmail) {
            throw new AppError({
                statusCode: 400,
                code: 'EMAIL_EXISTS',
                message: 'Email đã được sử dụng',
            });
        }

        // Kiểm tra MSSV đã tồn tại
        const existingMssv = await this.userModel.findOne({ mssv: createUserDto.mssv });
        if (existingMssv) {
            throw new AppError({
                statusCode: 400,
                code: 'MSSV_EXISTS',
                message: 'MSSV đã được sử dụng',
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

        // Tạo user mới
        const newUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
            role: createUserDto.role || 'user',
        });

        const savedUser = await newUser.save();
        return savedUser;
    }

    async getUserById(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(ERROR.INVALID_ID);
        }

        const user = await this.userModel.findById(id);
        if (!user) {
            throw new AppError(ERROR.USER_NOT_FOUND);
        }

        return user;
    }

    async updateUser(id: string, updateUserDto: UpdateUserRequestDto) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(ERROR.INVALID_ID);
        }

        const user = await this.userModel.findById(id);
        if (!user) {
            throw new AppError(ERROR.USER_NOT_FOUND);
        }

        // Kiểm tra email đã tồn tại (nếu có thay đổi email)
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingEmail = await this.userModel.findOne({
                email: updateUserDto.email,
                _id: { $ne: id }
            });
            if (existingEmail) {
                throw new AppError({
                    statusCode: 400,
                    code: 'EMAIL_EXISTS',
                    message: 'Email đã được sử dụng',
                });
            }
        }

        // Kiểm tra MSSV đã tồn tại (nếu có thay đổi MSSV)
        if (updateUserDto.mssv && updateUserDto.mssv !== user.mssv) {
            const existingMssv = await this.userModel.findOne({
                mssv: updateUserDto.mssv,
                _id: { $ne: id }
            });
            if (existingMssv) {
                throw new AppError({
                    statusCode: 400,
                    code: 'MSSV_EXISTS',
                    message: 'MSSV đã được sử dụng',
                });
            }
        }

        // Hash password mới nếu có
        if (updateUserDto.password) {
            const saltRounds = 10;
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
            id,
            updateUserDto,
            { new: true, runValidators: true }
        );

        return updatedUser;
    }

    async deleteUser(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(ERROR.INVALID_ID);
        }

        const user = await this.userModel.findById(id);
        if (!user) {
            throw new AppError(ERROR.USER_NOT_FOUND);
        }

        // Xóa user và các dữ liệu liên quan
        await Promise.all([
            this.userModel.findByIdAndDelete(id),
            this.postModel.updateMany({ userId: id }, { deleted: true, deletedAt: new Date() }),
            this.likeModel.updateMany({ userId: id }, { deleted: true, deletedAt: new Date() }),
            this.commentModel.updateMany({ userId: id }, { deleted: true, deletedAt: new Date() }),
        ]);

        return { message: 'Xóa user thành công' };
    }

}