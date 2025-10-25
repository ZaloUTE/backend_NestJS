import { PostResponse } from "./post.response.dto";
export class AllPostResponse {
    total: number;
    listPost: PostResponse[];

    constructor(total: number, listPost: PostResponse[]){
        this.total = total;
        this.listPost = listPost;
    }
}