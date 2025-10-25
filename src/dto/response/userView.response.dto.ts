export class UserViewResponse {
  id: string;
  name: string;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;

  constructor(
    id: string,
    name: string,
    totalPosts: number,
    totalLikes: number,
    totalComments: number,
    totalShares: number,
  ) {
    this.id = id;
    this.name = name;
    this.totalPosts = totalPosts;
    this.totalLikes = totalLikes;
    this.totalComments = totalComments;
    this.totalShares = totalShares;
  }
}
