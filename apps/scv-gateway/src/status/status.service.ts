import { Inject, Injectable } from '@nestjs/common';
import { ServiceStatusDto } from './dto/service-status.dto';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class StatusService {
  constructor(
    private dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject('MQ_SERVICE')
    private readonly mqClient: ClientProxy,
  ) {}

  async getStatus(): Promise<ServiceStatusDto> {
    const [
      [databaseConnection, lastMigration],
      queueConnection,
      [middlewareConnection, middlewareVersion],
    ] = await Promise.all([
      this.getDatabaseConnection(),
      this.getQueueConnection(),
      this.getMiddlewareConnection(),
    ]);
    const serviceStatusDto: ServiceStatusDto = {
      applicationVersion: APPLICATION_VERSION,
      lastMigration,
      databaseConnection: databaseConnection ? 'OK' : 'DOWN',
      queueConnection: queueConnection ? 'OK' : 'DOWN',
      middlewareConnection: middlewareConnection ? 'OK' : 'DOWN',
      middlewareVersion,
    };

    return serviceStatusDto;
  }

  private async getDatabaseConnection(): Promise<[boolean, string]> {
    try {
      const lastMigrations = await this.dataSource.query(
        'SELECT name FROM migrations ORDER BY id DESC LIMIT 1',
      );
      return [true, lastMigrations[0]?.name];
    } catch (error) {
      return [false, 'UNABLE TO CHECK'];
    }
  }

  private async getQueueConnection(): Promise<boolean> {
    try {
      await this.mqClient.connect();
      await this.mqClient.close();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async getMiddlewareConnection(): Promise<[boolean, string]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.configService.get('app').aeMdwUrl}/v2/status`,
        ),
      );
      return [true, response.data.mdw_version];
    } catch (error) {
      return [false, 'UNABLE TO CHECK'];
    }
  }
}
