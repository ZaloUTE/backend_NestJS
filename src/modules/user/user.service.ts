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
<<<<<<< HEAD
import { UserViewResponse } from "src/dto/response/userView.response.dto";
import { AllPostResponse } from "src/dto/response/allPost.response";
=======
import { CreateUserRequestDto } from "src/dto/request/create-user.request.dto";
import { UpdateUserRequestDto } from "src/dto/request/update-user.request.dto";
import { GetUsersQueryDto } from "src/dto/request/get-users.request.dto";
import * as bcrypt from 'bcrypt';
>>>>>>> 7b634c62a9055ceb71d12b0eaa1942efdc33dd76

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Post.name) private readonly postModel: Model<Post>,
        @InjectModel(Like.name) private readonly likeModel: Model<Like>,
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    ) { }
    async getAdminHome(): Promise<UserViewResponse[]>  {
        const listUser = await this.userModel.find();

        const results = await Promise.all(
            listUser.map(async (user) => {
                const [totalPosts, totalLikes, totalComments, totalShares] = await Promise.all([
                    this.postModel.countDocuments({ userId: user._id }),
                    this.likeModel.countDocuments({ userId: user._id }),
                    this.commentModel.countDocuments({ userId: user._id }),
                    this.postModel.countDocuments({ userId: user._id, originalPostId: { $ne: null } }),
                ]);

                return new UserViewResponse (user._id as string, user.name, totalPosts, totalLikes, totalComments, totalShares);
            })
        );

        return results;
    };

    async ensureUserExists(userId: string): Promise<User> {
        const user = await this.userModel.findById(userId);
        if (!user) throw new AppError(ERROR.USER_NOT_FOUND);
        return user;
    }

    async getAllPost(page: number, limit: number, userId: string): Promise<AllPostResponse> {
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

        return new AllPostResponse (total, listPostResult);

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

    // ========== GET ALL USERS WITH PAGINATION ==========

    async getAllUsers(query: GetUsersQueryDto) {
        const { page = 1, limit = 10, search, role } = query;
        const skip = (page - 1) * limit;

        // Build query conditions
        const conditions: any = {};

        if (search) {
            conditions.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mssv: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            conditions.role = role;
        }

        // Get total count
        const total = await this.userModel.countDocuments(conditions);

        // Get users with pagination
        const users = await this.userModel
            .find(conditions)
            .select('-password') // Exclude password from response
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get detailed statistics for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const [totalPosts, totalLikes, totalComments, totalShares, recentPosts] = await Promise.all([
                    // Total posts by user
                    this.postModel.countDocuments({ userId: user._id, deleted: false }),

                    // Total likes given by user
                    this.likeModel.countDocuments({ userId: user._id, deleted: false }),

                    // Total comments by user
                    this.commentModel.countDocuments({ userId: user._id, deleted: false }),

                    // Total shares by user
                    this.postModel.countDocuments({ userId: user._id, originalPostId: { $ne: null }, deleted: false }),

                    // Recent posts (last 3)
                    this.postModel
                        .find({ userId: user._id, deleted: false })
                        .select('content createdAt')
                        .sort({ createdAt: -1 })
                        .limit(3)
                ]);

                // Get posts liked by others (popularity)
                const postsLikedByOthers = await this.likeModel.aggregate([
                    { $match: { deleted: false } },
                    { $lookup: { from: 'posts', localField: 'postId', foreignField: '_id', as: 'post' } },
                    { $unwind: '$post' },
                    { $match: { 'post.userId': user._id, 'post.deleted': false } },
                    { $count: 'totalLikesReceived' }
                ]);

                const totalLikesReceived = postsLikedByOthers.length > 0 ? postsLikedByOthers[0].totalLikesReceived : 0;

                return {
                    ...user.toObject(),
                    statistics: {
                        totalPosts,
                        totalLikes,
                        totalComments,
                        totalShares,
                        totalLikesReceived,
                        recentPosts: recentPosts.map(post => ({
                            id: post._id,
                            content: post.content?.substring(0, 100) + (post.content?.length > 100 ? '...' : ''),
                            createdAt: (post as any).createdAt
                        }))
                    },
                    // Additional user info
                    profileInfo: {
                        hasAvatar: !!user.avatar,
                        hasBio: !!user.bio,
                        hasAddress: !!user.address,
                        accountAge: Math.floor((Date.now() - new Date((user as any).createdAt).getTime()) / (1000 * 60 * 60 * 24)) // days
                    }
                };
            })
        );

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            users: usersWithStats,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        };
    }

    // ========== GET USER DETAILED STATISTICS ==========

    async getUserDetailedStats(userId: string) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError(ERROR.INVALID_ID);
        }

        const user = await this.userModel.findById(userId).select('-password');
        if (!user) {
            throw new AppError(ERROR.USER_NOT_FOUND);
        }

        // Get comprehensive statistics
        const [
            totalPosts,
            totalLikes,
            totalComments,
            totalShares,
            postsLikedByOthers,
            recentPosts,
            topPosts,
            monthlyActivity
        ] = await Promise.all([
            // Basic counts
            this.postModel.countDocuments({ userId: user._id, deleted: false }),
            this.likeModel.countDocuments({ userId: user._id, deleted: false }),
            this.commentModel.countDocuments({ userId: user._id, deleted: false }),
            this.postModel.countDocuments({ userId: user._id, originalPostId: { $ne: null }, deleted: false }),

            // Posts liked by others (popularity)
            this.likeModel.aggregate([
                { $match: { deleted: false } },
                { $lookup: { from: 'posts', localField: 'postId', foreignField: '_id', as: 'post' } },
                { $unwind: '$post' },
                { $match: { 'post.userId': user._id, 'post.deleted': false } },
                { $count: 'totalLikesReceived' }
            ]),

            // Recent posts (last 5)
            this.postModel
                .find({ userId: user._id, deleted: false })
                .select('content createdAt likeCount commentCount shareCount')
                .sort({ createdAt: -1 })
                .limit(5),

            // Top posts by engagement
            this.postModel.aggregate([
                { $match: { userId: user._id, deleted: false } },
                { $lookup: { from: 'likes', localField: '_id', foreignField: 'postId', as: 'likes' } },
                { $lookup: { from: 'comments', localField: '_id', foreignField: 'postId', as: 'comments' } },
                {
                    $addFields: {
                        totalEngagement: {
                            $add: [
                                { $size: '$likes' },
                                { $size: '$comments' }
                            ]
                        }
                    }
                },
                { $sort: { totalEngagement: -1 } },
                { $limit: 3 },
                { $project: { content: 1, createdAt: 1, totalEngagement: 1 } }
            ]),

            // Monthly activity (last 6 months)
            this.postModel.aggregate([
                { $match: { userId: user._id, deleted: false } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        posts: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 6 }
            ])
        ]);

        const totalLikesReceived = postsLikedByOthers.length > 0 ? postsLikedByOthers[0].totalLikesReceived : 0;

        return {
            user: {
                ...user.toObject(),
                profileInfo: {
                    hasAvatar: !!user.avatar,
                    hasBio: !!user.bio,
                    hasAddress: !!user.address,
                    accountAge: Math.floor((Date.now() - new Date((user as any).createdAt).getTime()) / (1000 * 60 * 60 * 24))
                }
            },
            statistics: {
                basic: {
                    totalPosts,
                    totalLikes,
                    totalComments,
                    totalShares,
                    totalLikesReceived
                },
                engagement: {
                    totalEngagement: totalLikesReceived + totalComments,
                    averagePostsPerMonth: totalPosts / Math.max(1, Math.floor((Date.now() - new Date((user as any).createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))),
                    engagementRate: totalPosts > 0 ? (totalLikesReceived + totalComments) / totalPosts : 0
                },
                recentActivity: {
                    recentPosts: recentPosts.map(post => ({
                        id: post._id,
                        content: post.content?.substring(0, 150) + (post.content?.length > 150 ? '...' : ''),
                        createdAt: (post as any).createdAt,
                        engagement: ((post as any).likeCount || 0) + ((post as any).commentCount || 0) + ((post as any).shareCount || 0)
                    })),
                    topPosts: topPosts.map(post => ({
                        id: post._id,
                        content: post.content?.substring(0, 150) + (post.content?.length > 150 ? '...' : ''),
                        createdAt: (post as any).createdAt,
                        totalEngagement: post.totalEngagement
                    }))
                },
                monthlyActivity: monthlyActivity.map(month => ({
                    year: month._id.year,
                    month: month._id.month,
                    posts: month.posts
                }))
            }
        };
    }

}