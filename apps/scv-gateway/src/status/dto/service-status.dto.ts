import { ApiProperty } from '@nestjs/swagger';

export class ServiceStatusDto {
  @ApiProperty()
  applicationVersion: string;

  @ApiProperty()
  databaseConnection: 'OK' | 'DOWN';

  @ApiProperty()
  lastMigration?: string;

  @ApiProperty()
  queueConnection: 'OK' | 'DOWN';

  @ApiProperty()
  middlewareConnection: 'OK' | 'DOWN';

  @ApiProperty()
  middlewareVersion?: string;
}
