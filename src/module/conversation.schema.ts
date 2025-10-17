import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop()
  name?: string;

  @Prop({ default: false })
  isGroup: boolean;

  @Prop({ type: [String], required: true })
  members: string[];

  @Prop({ default: null })
  avatar?: string;

  @Prop({ required: true })
  createdBy: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
