import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractSubmissionDto } from './dto/contract-submission.dto';
import { ContractSubmission } from './entities/contract-submission.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractSubmission)
    private contractSubmissionsRepository: Repository<ContractSubmission>,
  ) {}

  submit(contractSubmissionDto: ContractSubmissionDto) {
    this.contractSubmissionsRepository.save(contractSubmissionDto);
    return 'Contract submitted successfully';
  }

  findAll() {
    return this.contractSubmissionsRepository.find();
  }

  findOne(id: string) {
    return `This action returns a #${id} contract`;
  }
}
