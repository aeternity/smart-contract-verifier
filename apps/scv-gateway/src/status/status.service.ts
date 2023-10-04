import { Injectable } from '@nestjs/common';
import { ServiceStatusDto } from './dto/service-status.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class StatusService {
  constructor(private dataSource: DataSource) {}

  async getStatus(): Promise<ServiceStatusDto> {
    const lastMigrations = await this.dataSource.query(
      'SELECT * FROM public.migrations ORDER BY id DESC LIMIT 1',
    );

    const serviceStatusDto: ServiceStatusDto = {
      application_version: APPLICATION_VERSION,
      last_migration: lastMigrations[0]?.name || 'none',
    };

    return serviceStatusDto;
  }
}
