import { ValidationPipe, ValidationError } from '@nestjs/common';
import { AppError } from '../errors/app.error';

export function CustomValidationPipe() {
    return new ValidationPipe({ // cái new ValidationPipe của nest/common là nó sẽ tự động validate cái DTO nếu trong DTO có sử dụng decorator của class validator
        transform: true, // chuyển từ string sang liểu dữ liệu quy định trong DTO
        whitelist: true, // loại bỏ các biến không có khai báo trong DTO
        exceptionFactory: (errors: ValidationError[]) => {  // cái lỗi được quăng vào exceptionFactory
            // gom message từ class-validator
            const messages = errors
                .map(err => Object.values(err.constraints || {}).join(', '))
                .join('; ');

            // throw AppError
            throw new AppError({
                statusCode: 400,
                code: 'INVALID_QUERY',
                message: messages || 'Dữ liệu đầu vào không hợp lệ',
            });
        },
    });
}