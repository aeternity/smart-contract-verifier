import { ApiProperty } from '@nestjs/swagger';

export class ServiceStatusDto {
  @ApiProperty()
  applicationVersion: string;

  @ApiProperty()
  lastMigration?: string;
}
