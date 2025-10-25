import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
declare const module: any;
import { CustomeExceptionFilter } from './common/filters/exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe';

async function bootstrap() {


  const app = await NestFactory.create(AppModule);

<<<<<<< HEAD
  // 👇 Đăng ký global exception filter và Interceptor và Validation Pipe 
  app.useGlobalFilters(new CustomeExceptionFilter());
=======
  app.enableCors({
    origin: ['http://localhost:3002'], // các domain được phép
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // các HTTP methods được phép
    allowedHeaders: ['Content-Type', 'Authorization'], // các header được phép gửi
    credentials: true, // cho phép gửi cookie/token
  });

  // 👇 Đăng ký global exception filter và Interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
>>>>>>> 7b634c62a9055ceb71d12b0eaa1942efdc33dd76
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(CustomValidationPipe());

<<<<<<< HEAD
  app.enableCors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3002"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false
  });

=======
>>>>>>> 7b634c62a9055ceb71d12b0eaa1942efdc33dd76
  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}
bootstrap();
