import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    // Đăng ký module passport để NestJS biết bạn đang dùng Passport cho authentication.
    PassportModule.register({ defaultStrategy: 'jwt' }), // Strategy này đã được khai báo trong jwtService à
    // hàm register nhận vào tham số cấu hình, rồi tự tạo ra providers tương ứng.

    JwtModule.registerAsync({  // khai báo JWT Module để có thể dùng JWT service trong authService (sign đồ á)
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // 👇 Hỗ trợ định dạng chuỗi như '1h', '7d', '3600s' v.v.
          expiresIn: configService.get<string>('JWT_EXPIRES') || '1h',
        } as JwtSignOptions,
      }),
    }),

    UserModule,
  ],
  controllers: [AuthController], // ✅ đăng ký controller tại đây
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
