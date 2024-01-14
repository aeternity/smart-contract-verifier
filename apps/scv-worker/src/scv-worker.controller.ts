import { Controller, Get } from '@nestjs/common';

@Controller()
export class SvcWorkerController {
  @Get()
  getHello(): string {
    return 'The worker is running';
  }
}
