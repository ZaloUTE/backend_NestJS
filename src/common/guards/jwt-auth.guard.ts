import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppError } from '../errors/app.error';
import { ERROR } from '../errors/error.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      console.log('❌ JWT Auth Error:', err?.message);
      throw new AppError(ERROR.UNAUTHORIZED);
    }
    return user;
  }
}
