import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppError } from '../errors/app.error';
import { ERROR } from '../errors/error.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
    if (err || !user) {
      // ✅ Dùng AppError custom
      throw new AppError(ERROR.UNAUTHORIZED);
    }
    return user;
  }
}
