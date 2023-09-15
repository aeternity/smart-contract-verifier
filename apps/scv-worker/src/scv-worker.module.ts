import { Module } from '@nestjs/common';
import { ScvWorkerController } from './scv-worker.controller';
import { ScvWorkerService } from './scv-worker.service';

@Module({
  imports: [],
  controllers: [ScvWorkerController],
  providers: [ScvWorkerService],
})
export class ScvWorkerModule {}
