import { Controller, Get, Query, Req, ValidationPipe  } from "@nestjs/common";
import { UserService } from "./user.service";
import { AppError } from "src/common/errors/app.error";
import { GetPostsQueryDto } from "src/dto/request/getPost.request.dto";


@Controller('admins')
export class UserController {
     constructor(private readonly userService: UserService) { };

     @Get('/home')
     getAdminHome() {
          return this.userService.getAdminHome();
     }

     @Get("/detail")
     async getAllPost(
          @Req() req: Request,
          @Query(
               new ValidationPipe({
                    transform: true,
                    whitelist: true,
                    forbidNonWhitelisted: true,
                    stopAtFirstError: true,
                    exceptionFactory: (errors) => {
                         // gom message từ class-validator
                         const messages = errors
                              .map(err => Object.values(err.constraints || {}).join(', '))
                              .join('; ');

                         // throw AppError
                         throw new AppError({
                              statusCode: 400,
                              code: 'INVALID_QUERY',
                              message: messages || 'Dữ liệu không hợp lệ',
                         });
                    },
               }),
          )
          query: GetPostsQueryDto,
     ) {
          const { page, limit, userId } = query;
          return await this.userService.getAllPost(page, limit, userId);
     }
}