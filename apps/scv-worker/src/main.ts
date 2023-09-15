import { NestFactory } from '@nestjs/core';
import { ScvWorkerModule } from './scv-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(ScvWorkerModule);
  await app.listen(3001);
}
bootstrap();
