import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ default: '' })
  content: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: Post.name, default: null, index: true })
  originalPostId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Post.name, default: null, index: true })
  rootPostId?: Types.ObjectId;

  @Prop({ default: false, index: true })
  deleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ userId: 1, createdAt: -1 });
