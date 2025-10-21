import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

// Import schemas
import { User, UserSchema } from '../module/user.schema';
import { Post, PostSchema } from '../module/post.schema';
import { Comment, CommentSchema } from '../module/comment.schema';
import { Like, LikeSchema } from '../module/like.schema';
import { Conversation, ConversationSchema } from '../module/conversation.schema';
import { Message, MessageSchema } from '../module/message.schema';
import { FriendRequest, FriendRequestSchema } from '../module/friend-request.schema';
import { Friendship, FriendshipSchema } from '../module/friendship.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        console.log(`📡 Đang kết nối MongoDB tới: ${uri}`);

        return {
          uri,
          // 🟢 connectionFactory sẽ chạy khi kết nối hoàn tất
          connectionFactory: (connection) => {
            connection.once('open', () => {
              console.log('✅ MongoDB Connected!');
            });

            connection.on('error', (err) => {
              console.error('❌ MongoDB Error:', err.message);
            });

            connection.on('disconnected', () => {
              console.warn('⚠️ MongoDB Disconnected.');
            });

            return connection;
          },
        };
      },
    }),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
      { name: Friendship.name, schema: FriendshipSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }
