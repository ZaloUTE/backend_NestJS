import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,   //object giúp lấy ra các đối tượng gốc như request, response,...
  HttpException,  
  HttpStatus, 
} from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '../errors/app.error';

@Catch() // cho nestJS biết đây là class bắt và xử lý exception của toàn bộ hệ thống
export class CustomeExceptionFilter implements ExceptionFilter {  // class này bắt buộc phải có phương thức catch để xử lý lỗi
  catch(exception: unknown, host: ArgumentsHost) {  // hàm tự động được gọi khi có lỗi xãy ra trong toàn bộ ứng dụng
    const ctx = host.switchToHttp();  // chuyển ngữ cảnh về HTTP để có thể truy cập vào request, response của express
    const response = ctx.getResponse<Response>(); // lấy ra đối tượng response, dùng để tự gửi lại response JSON tùy chỉnh cho client

    // mặc định nếu như không biết lỗi gì thì quăng ra lỗi là 500  
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi không xác định';
    let code: string | undefined = undefined;

    console.error('🔥 ERROR:', exception);

    // mình sẽ ưu tiên xử lý AppError trước 
    if (exception instanceof AppError){
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
    }
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse(); // đây là lỗi mà cái http ex trả về

      if (typeof res === 'string') {
        message = res;
      }
      else if (typeof res === 'object' && (res as any).message){
        const msg = (res as any).message;
        // Nếu message là mảng (do class-validator trả về), nối lại cho gọn
        message = Array.isArray(msg) ? msg.join(', ') : msg;
      }
    }
    else // các lỗi còn lại 
    {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (exception instanceof Error && exception.message) {
        message = `Lỗi hệ thống: ${exception.message}`;
      }
      else {
        message = 'Lỗi không xác định';
      }
    }

    
    response.status(status).json({
      statusCode: status,
      message,
      code,
      data: null,
    });
  }
}
