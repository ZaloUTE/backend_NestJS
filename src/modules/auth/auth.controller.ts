import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetTokenRequest } from 'src/dto/request/getToken.request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/getToken')
  async getToken(@Body() body: GetTokenRequest) {
    return this.authService.generateToken(body.userId);
  }
}
