import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '../errors/app.error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {  // class này bắt buộc phải có phương thức catch để xử lý lỗi
  catch(exception: unknown, host: ArgumentsHost) {  // hàm tự động được gọi khi có lỗi xãy ra trong toàn bộ ứng dụng
    const ctx = host.switchToHttp();  // chuyển ngữ cảnh về HTTP để có thể truy cập vào request, response của express
    const response = ctx.getResponse<Response>(); // lấy ra đối tượng response, dùng để tự gửi lại response JSON tùy chỉnh cho client

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi không xác định';
    let code: string | undefined = undefined;

    console.error('🔥 ERROR:', exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && (res as any).message) {
        message = (res as any).message;
      }
    }
    else if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
    }

    response.status(status).json({
      statusCode: status,
      message,
      code,
      data: null,
    });
  }
}
