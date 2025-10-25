import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetTokenRequest } from 'src/dto/request/getToken.request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/getToken')
<<<<<<< HEAD
  async getToken(@Body() body: GetTokenRequest) {
    return this.authService.generateToken(body.userId);
=======
  async getToken(@Body('id') userId: string) {
    return this.authService.generateToken(userId);
>>>>>>> 7b634c62a9055ceb71d12b0eaa1942efdc33dd76
  }
}
