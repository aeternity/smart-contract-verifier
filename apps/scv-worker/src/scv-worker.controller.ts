import { Controller, Get } from '@nestjs/common';
import { ScvWorkerService } from './scv-worker.service';

@Controller()
export class ScvWorkerController {
  constructor(private readonly scvWorkerService: ScvWorkerService) {}

  @Get()
  getHello(): string {
    return this.scvWorkerService.getHello();
  }
}
