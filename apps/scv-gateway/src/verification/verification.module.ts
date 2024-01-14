import { Module } from '@nestjs/common';
import { VerificationSchedulerService } from './verification-scheduler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractSubmission } from '../contracts/entities/contract-submission.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MqConfig } from '../config/config.type';
import { ContractVerificationRecord } from './entities/contract-verification-record.entity';
import { VerificationController } from './verification.controller';
import { VerificationSupervisorService } from './verification-supervisor.service';
import { ContractsModule } from '../contracts/contracts.module';
import { CompilersController } from './compilers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractSubmission, ContractVerificationRecord]),
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
            queue: 'verification_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ContractsModule,
  ],
  controllers: [VerificationController, CompilersController],
  providers: [VerificationSchedulerService, VerificationSupervisorService],
})
export class VerificationModule {}
