import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MqConfig } from '../config/config.type';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'MQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
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
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
