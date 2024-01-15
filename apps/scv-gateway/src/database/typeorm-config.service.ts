import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AllConfigType } from '../config/config.type';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('database.host' as any, { infer: true }),
      port: this.configService.get('database.port' as any, { infer: true }),
      username: this.configService.get('database.username' as any, {
        infer: true,
      }),
      password: this.configService.get('database.password' as any, {
        infer: true,
      }),
      database: this.configService.get('database.name' as any, { infer: true }),
      synchronize: this.configService.get('database.synchronize' as any, {
        infer: true,
      }),
      dropSchema: false,
      keepConnectionAlive: true,
      logging:
        this.configService.get('app.nodeEnv', { infer: true }) !== 'production',
      entities: [path.resolve(__dirname, '../**/*.entity{.ts,.js}')],
      autoLoadEntities: true,
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      cli: {
        entitiesDir: 'apps/scv-gateway/src',
        migrationsDir: 'apps/scv-gateway/src/database/migrations',
        subscribersDir: 'subscriber',
      },
      namingStrategy: new SnakeNamingStrategy(),
    } as TypeOrmModuleOptions;
  }
}
