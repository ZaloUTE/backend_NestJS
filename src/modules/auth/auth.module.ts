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
    // Nếu AppModule đã có ConfigModule.forRoot({ isGlobal: true }) thì không cần thêm lại
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
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
