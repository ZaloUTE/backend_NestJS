import { Controller, Get, Post, Put, Delete, Query, Req, Body, Param, ValidationPipe, UseGuards  } from "@nestjs/common";
import { UserService } from "./user.service";
import { AppError } from "src/common/errors/app.error";
import { GetPostsQueryDto } from "src/dto/request/getPost.request.dto";
import { CreateUserRequestDto } from "src/dto/request/create-user.request.dto";
import { UpdateUserRequestDto } from "src/dto/request/update-user.request.dto";
import { UserResponseDto } from "src/dto/response/user.response.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";



@Controller('admins')
export class UserController {
     constructor(private readonly userService: UserService) { };

     @Get('/home')
     @UseGuards(JwtAuthGuard)
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

     // ========== USER MANAGEMENT ENDPOINTS ==========

     @Post('/users')
     async createUser(
          @Body(
               new ValidationPipe({
                    transform: true,
                    whitelist: true,
                    forbidNonWhitelisted: true,
                    stopAtFirstError: true,
                    exceptionFactory: (errors) => {
                         const messages = errors
                              .map(err => Object.values(err.constraints || {}).join(', '))
                              .join('; ');
                         throw new AppError({
                              statusCode: 400,
                              code: 'INVALID_DATA',
                              message: messages || 'Dữ liệu không hợp lệ',
                         });
                    },
               }),
          )
          createUserDto: CreateUserRequestDto,
     ) {
          const user = await this.userService.createUser(createUserDto);
          return new UserResponseDto(user);
     }

     @Get('/users/:id')
     async getUserById(@Param('id') id: string) {
          const user = await this.userService.getUserById(id);
          return new UserResponseDto(user);
     }

     @Put('/users/:id')
     async updateUser(
          @Param('id') id: string,
          @Body(
               new ValidationPipe({
                    transform: true,
                    whitelist: true,
                    forbidNonWhitelisted: true,
                    stopAtFirstError: true,
                    exceptionFactory: (errors) => {
                         const messages = errors
                              .map(err => Object.values(err.constraints || {}).join(', '))
                              .join('; ');
                         throw new AppError({
                              statusCode: 400,
                              code: 'INVALID_DATA',
                              message: messages || 'Dữ liệu không hợp lệ',
                         });
                    },
               }),
          )
          updateUserDto: UpdateUserRequestDto,
     ) {
          const user = await this.userService.updateUser(id, updateUserDto);
          return new UserResponseDto(user);
     }

     @Delete('/users/:id')
     async deleteUser(@Param('id') id: string) {
          await this.userService.deleteUser(id);
          return { message: 'Xóa user thành công' };
     }
}