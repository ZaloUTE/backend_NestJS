import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
declare const module: any;
import { CustomeExceptionFilter } from './common/filters/exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe';

async function bootstrap() {


  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CustomeExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(CustomValidationPipe());


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

  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}
bootstrap();
