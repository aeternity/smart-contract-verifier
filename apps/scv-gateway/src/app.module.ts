import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ContractsModule } from './contracts/contracts.module';
import { StatusModule } from './status/status.module';
import { VerificationModule } from './verification/verification.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import mqConfig from './config/mq.config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, mqConfig, appConfig],
      envFilePath: ['.env'],
    }),
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
})
export class AppModule {}
