import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';
import { ServiceStatusDto } from './dto/service-status.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'List basic service health information' })
  getStatus(): Promise<ServiceStatusDto> {
    return this.statusService.getStatus();
  }
}
