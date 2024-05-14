import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BusinessExceptionFilter } from './exception/BusinessExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new BusinessExceptionFilter());

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
