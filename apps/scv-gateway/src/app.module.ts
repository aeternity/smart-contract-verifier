import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ContractsModule } from './contracts/contracts.module';
import { StatusModule } from './status/status.module';
import { VerificationModule } from './verification/verification.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import mqConfig from './config/mq.config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, mqConfig, appConfig],
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 5,
      },
      {
        name: 'medium',
        ttl: 20000,
        limit: 15,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 40,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    ScheduleModule.forRoot(),
    ContractsModule,
    StatusModule,
    VerificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
