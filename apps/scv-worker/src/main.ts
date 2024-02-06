import { NestFactory } from '@nestjs/core';
import { ScvWorkerModule } from './scv-worker.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MqConfig } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(ScvWorkerModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get<MqConfig>('mq').username}:${
          configService.get<MqConfig>('mq').password
        }@${configService.get<MqConfig>('mq').host}:${
          configService.get<MqConfig>('mq').port
        }`,
      ],
      queue: configService.get<MqConfig>('mq').verificationQueue,
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
