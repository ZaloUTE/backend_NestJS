import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport'; // passport jwt 
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { //
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // cách lấy token như hàm này thì nó lấy từ header / auth / Baerer
      ignoreExpiration: false, // không bỏ qua kiểm tra hết hạn (tức là có kiểm tra đó)
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey',
    });
    // cái hàm super này sẽ tự động thực hiện việc giải mã JWT
  }
  
  // khi validate thành công thì nó mới trả về pay load cho hàm này
  async validate(payload: any) {
    // validateUser sẽ kiểm tra user có tồn tại hay không
    return this.authService.validateUser(payload);
  }
}
