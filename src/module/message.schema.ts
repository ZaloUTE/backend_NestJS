import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Conversation } from './conversation.schema';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: Conversation.name, required: true })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  senderId: string;

  @Prop({ trim: true })
  content?: string;

  @Prop({ enum: ['text', 'image', 'call'], default: 'text' })
  type: string;

  @Prop({ type: [{ url: String, name: String }], default: [] })
  attachments?: { url: string; name: string }[];

  @Prop({ type: [{ userId: String, type: String }], default: [] })
  reactions?: { userId: string; type: string }[];

  @Prop({ type: [String], default: [] })
  readBy: string[];

  @Prop({ type: [String], default: [] })
  deletedBy: string[];

  @Prop({ default: false })
  isDeletedForAll: boolean;

  @Prop({ enum: ['ended', 'ongoing', 'canceled', 'rejected', 'ringing'] })
  callStatus?: string;

  @Prop()
  startedAt?: Date;

  @Prop()
  endedAt?: Date;

  @Prop()
  duration?: number;

  @Prop({ type: [String], default: [] })
  joinedUsers?: string[];

  @Prop({ type: [String], default: [] })
  rejectedUsers?: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
