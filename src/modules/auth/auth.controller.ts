import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/getToken')
  async getToken(@Body('userId') userId: string) {
    return this.authService.generateToken(userId);
  }
}
