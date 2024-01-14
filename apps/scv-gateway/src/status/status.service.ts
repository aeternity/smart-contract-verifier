import { Injectable } from '@nestjs/common';
import { ServiceStatusDto } from './dto/service-status.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class StatusService {
  constructor(private dataSource: DataSource) {}

  async getStatus(): Promise<ServiceStatusDto> {
    let lastMigration: string;
    try {
      const lastMigrations = await this.dataSource.query(
        'SELECT name FROM migrations ORDER BY id DESC LIMIT 1',
      );
      lastMigration = lastMigrations[0]?.name;
    } catch (e) {
      lastMigration = 'unable to check';
    }
    const serviceStatusDto: ServiceStatusDto = {
      applicationVersion: APPLICATION_VERSION,
      lastMigration: lastMigration,
    };

    return serviceStatusDto;
  }
}
