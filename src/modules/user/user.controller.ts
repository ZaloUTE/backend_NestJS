import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetPostsQueryDto } from "src/dto/request/getPost.request.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";


@Controller('admins')
export class UserController {
     constructor(private readonly userService: UserService) { };

     @UseGuards(JwtAuthGuard)
     @Get('/home')
     getAdminHome() {
          return this.userService.getAdminHome();
     }

     @UseGuards(JwtAuthGuard)
     @Get("/detail")
     async getAllPost( @Query() query: GetPostsQueryDto ) { // chỉ có query ở đây thì nó sẽ tự động check data
          const { page, limit, userId } = query;
          return await this.userService.getAllPost(page, limit, userId);
     }
}