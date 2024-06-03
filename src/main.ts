import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BusinessExceptionFilter } from './exception/BusinessExceptionFilter';
import { getNestOptions } from './app.options';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, getNestOptions());
  app.useGlobalFilters(new BusinessExceptionFilter());
  app.use(cookieParser());

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:5173', process.env.BASE_URL],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
    exposedHeaders: ['Authorization'],
  });
  await app.listen(3000);
}
bootstrap();
