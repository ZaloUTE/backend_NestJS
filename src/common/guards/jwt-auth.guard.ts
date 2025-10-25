import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // thuộc về cái thằng pass port luôn á để áp strategy vào route
import { AppError } from '../errors/app.error';
import { ERROR } from '../errors/error.enum';

@Injectable() // cai injectable nay nam trong nestjs/common de co the export ra su dung o moi khac
export class JwtAuthGuard extends AuthGuard('jwt') {  // dang ky cai jwt
  handleRequest(err: any, user: any) {  // ham nay la overide lai cai ham cua AuthGuard, là hook mà AuthGuard sẽ gọi sau khi strategy đã chạy xong.
    if (err || !user) {   // neu nhu co loi khi parse thi quang ra app error
      // ✅ Dùng AppError custom
      console.log("ERROR: ", err);
      throw new AppError(ERROR.UNAUTHORIZED);
    }
    return user; // neu khong co loi thi tiep tuc di toi cai controller
  }
}
