import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Friendship extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userA: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userB: Types.ObjectId;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

FriendshipSchema.index({ userA: 1, userB: 1 }, { unique: true });

FriendshipSchema.pre('save', function (next) {
  const doc = this as any;
  const ids = [doc.userA.toString(), doc.userB.toString()].sort();
  doc.userA = ids[0];
  doc.userB = ids[1];
  next();
});
