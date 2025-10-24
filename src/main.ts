import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
declare const module: any;
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {


  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3002'], // các domain được phép
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // các HTTP methods được phép
    allowedHeaders: ['Content-Type', 'Authorization'], // các header được phép gửi
    credentials: true, // cho phép gửi cookie/token
  });

  // 👇 Đăng ký global exception filter và Interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}
bootstrap();
