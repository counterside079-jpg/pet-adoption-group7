import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

declare const process: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // 👈 เพิ่มบรรทัดนี้ เพื่อให้ทุก Endpoint ขึ้นต้นด้วย /api อัตโนมัติ
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend พร้อมทำงานแล้วที่: http://localhost:${port}/api`);
}
bootstrap();