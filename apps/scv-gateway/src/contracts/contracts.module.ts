import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractSubmission } from './entities/contract-submission.entity';
import { ContractSubmissionSourceFile } from './entities/contract-submission-source-file.entity';
import { ContractSourceFile } from './entities/contract-source-file.entity';
import { Contract } from './entities/contract.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractSubmission,
      ContractSubmissionSourceFile,
      ContractSourceFile,
      Contract,
    ]),
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
