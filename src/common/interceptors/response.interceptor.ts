import {
  Injectable,
  NestInterceptor,
  ExecutionContext, // chứa thông tin của request hiện tại (controller, method, request, response,...).
  CallHandler, // là đối tượng đại diện cho phần tiếp theo trong pipeline (tức là controller của bạn).
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {  // Interceptor là một middleware đặc biệt chuyên xử lý phản hồi (response) sau khi controller đã xử lý xong.
  // Request → Guard → Interceptor (trước) → Controller → Interceptor (sau) → Response
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(  //next.handle.pipe.map là lấy data từ cái thằng controller đó
      map((data) => ({  // data này lấy từ thằng controller
        statusCode: HttpStatus.SUCCESS,
        message: HttpMessage.SUCCESS,
        data, // data này nhận lại từ controller, có thể là cái lớp DTO
      })),
    );
  }
}
