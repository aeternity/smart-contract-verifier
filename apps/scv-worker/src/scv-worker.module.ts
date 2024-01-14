import { Module } from '@nestjs/common';
import { VerificationModule } from './verification/verification.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import mqConfig from './config/mq.config';
import { SvcWorkerController } from './scv-worker.controller';
import gatewayApiConfig from './config/gateway-api.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mqConfig, gatewayApiConfig, appConfig],
      envFilePath: ['.env'],
    }),
    VerificationModule,
  ],
  controllers: [SvcWorkerController],
})
export class ScvWorkerModule {}
