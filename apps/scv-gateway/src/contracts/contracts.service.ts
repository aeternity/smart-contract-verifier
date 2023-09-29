import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractSubmissionDto } from './dto/contract-submission.dto';
import { ContractSubmission } from './entities/contract-submission.entity';
import { ContractSubmissionSourceFile } from './entities/contract-submission-source-file.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractSubmission)
    private contractSubmissionsRepository: Repository<ContractSubmission>,
  ) {}

  submit(
    contractSubmissionDto: ContractSubmissionDto,
    sourceFiles: Array<Express.Multer.File>,
  ) {
    const contractSubmission = new ContractSubmission();
    contractSubmission.contractId = contractSubmissionDto.contractId;
    contractSubmission.license = contractSubmissionDto.license;
    contractSubmission.compiler = contractSubmissionDto.compiler;
    contractSubmission.entryFile = contractSubmissionDto.entryFile;
    contractSubmission.sourceFiles = [];

    for (const file of sourceFiles) {
      const sourceFile = new ContractSubmissionSourceFile();
      sourceFile.fileName = file.originalname;
      sourceFile.content = file.buffer.toString();
      contractSubmission.sourceFiles.push(sourceFile);
    }

    this.contractSubmissionsRepository.save(contractSubmission);
    return 'Contract submitted successfully';
  }

  findAll() {
    return this.contractSubmissionsRepository.find();
  }

  findOne(id: string) {
    return `This action returns a #${id} contract`;
  }
}
