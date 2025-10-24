import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AppError } from 'src/common/errors/app.error';
import { ERROR } from 'src/common/errors/error.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) { }

  async generateToken(userId: string) {
    const user = await this.userService.ensureUserExists(userId);
    if (!user) {
      throw new AppError(ERROR.USER_NOT_FOUND);
    }
    const payload = { user: user };
    const token = this.jwtService.sign(payload);
      return { access_token: token };
  }

  async validateUser(payload: any) {
    return this.userService.ensureUserExists(payload.user._id);
  }
}
