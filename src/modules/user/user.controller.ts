import {
     Controller,
     Get,
     Post,
     Put,
     Delete,
     Query,
     Req,
     Param,
     Body,
     ValidationPipe,
     UseGuards
} from "@nestjs/common";
import { UserService } from "./user.service";
import { GetPostsQueryDto } from "src/dto/request/getPost.request.dto";
import { CreateUserRequestDto } from "src/dto/request/create-user.request.dto";
import { UpdateUserRequestDto } from "src/dto/request/update-user.request.dto";
import { GetUsersQueryDto } from "src/dto/request/get-users.request.dto";
import { UserResponseDto } from "src/dto/response/user.response.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { AppError } from "src/common/errors/app.error";



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
     async getAllPost(@Query() query: GetPostsQueryDto) {
          const { page, limit, userId } = query;
          return await this.userService.getAllPost(page, limit, userId);
     }


     // ========== USER MANAGEMENT ENDPOINTS ==========

     @Get('/users')
     @UseGuards(JwtAuthGuard)
     async getAllUsers(
          @Query(
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
                              code: 'INVALID_QUERY',
                              message: messages || 'Dữ liệu không hợp lệ',
                         });
                    },
               }),
          )
          query: GetUsersQueryDto,
     ) {
          return await this.userService.getAllUsers(query);
     }

     @Post('/users')
     @UseGuards(JwtAuthGuard)
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
     @UseGuards(JwtAuthGuard)
     async getUserById(@Param('id') id: string) {
          const user = await this.userService.getUserById(id);
          return new UserResponseDto(user);
     }

     @Get('/users/:id/stats')
     @UseGuards(JwtAuthGuard)
     async getUserDetailedStats(@Param('id') id: string) {
          return await this.userService.getUserDetailedStats(id);
     }

     @Put('/users/:id')
     @UseGuards(JwtAuthGuard)
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
     @UseGuards(JwtAuthGuard)
     async deleteUser(@Param('id') id: string) {
          await this.userService.deleteUser(id);
          return { message: 'Xóa user thành công' };
     }
}