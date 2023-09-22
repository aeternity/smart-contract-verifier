import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractSubmission } from './entities/contract-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContractSubmission])],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
