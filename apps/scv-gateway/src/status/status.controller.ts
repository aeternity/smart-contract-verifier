import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';
import { ServiceStatusDto } from './dto/service-status.dto';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  getStatus(): Promise<ServiceStatusDto> {
    return this.statusService.getStatus();
  }
}
