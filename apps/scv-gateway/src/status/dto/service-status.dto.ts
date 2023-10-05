import { ApiProperty } from '@nestjs/swagger';

export class ServiceStatusDto {
  @ApiProperty()
  application_version: string;

  @ApiProperty()
  last_migration?: string;
}
