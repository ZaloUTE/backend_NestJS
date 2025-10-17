export class PostResponse {
  id: string;
  content: string;
  images: string[];
  createdAt: Date;

  user: { id: string; name: string; avatarUrl: string } | null;
  likeCount: number;
  likes: any[];
  commentCount: number;
  commentUsers: any[];
  rootPostId?: string;
  originalPostId?: string;
  rootPost: any | null;
  shareCount: number;
  shareUsers: any[];
  liked: boolean;

  constructor(post: any) {
    this.id = post.id;
    this.content = post.content;
    this.images = post.images || [];
    this.createdAt = post.createdAt;

    this.user = post.user
      ? { id: post.user._id, name: post.user.name, avatarUrl: post.user.avatar }
      : null;

    this.likeCount = post.likeCount || 0;
    this.likes = (post.likes || []).map(like => ({
      id: like.id,
      createdAt: like.createdAt,
      user: like.user ? { id: like.user._id, name: like.user.name, avatarUrl: like.user.avatar } : null
    }));

    this.commentCount = post.commentCount || 0;
    this.commentUsers = (post.commentUsers || []).map(comment => ({
      id: comment.id,
      postId: comment.postId,
      content: comment.content,
      images: comment.images,
      parentCommentId: comment.parentCommentId,
      childs: comment.childs,
      user: comment.user ? { id: comment.user._id, name: comment.user.name, avatarUrl: comment.user.avatar } : null,
      createdAt: comment.createdAt
    }));

    this.rootPostId = post.rootPostId;
    this.originalPostId = post.originalPostId;

    this.rootPost = post.rootPost
      ? {
          id: post.rootPost.id,
          content: post.rootPost.content,
          images: post.rootPost.images,
          createdAt: post.rootPost.createdAt,
          user: post.rootPost.user ? { id: post.rootPost.user._id, name: post.rootPost.user.name, avatarUrl: post.rootPost.user.avatar } : null
        }
      : null;

    this.shareCount = post.shareCount || 0;
    this.shareUsers = (post.shareUsers || []).map(s => ({
      id: s.id,
      createdAt: s.createdAt,
      user: s.user ? { id: s.user._id, name: s.user.name, avatarUrl: s.user.avatar } : null
    }));
  }
}
