import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractSubmissionDto } from './dto/contract-submission.dto';
import { ContractSubmission } from './entities/contract-submission.entity';
import { ContractSubmissionSourceFile } from './entities/contract-submission-source-file.entity';
import { ContractSubmissionResponseDto } from './dto/contract-submission-response.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractSubmission)
    private contractSubmissionsRepository: Repository<ContractSubmission>,
  ) {}

  async submit(
    contractId: string,
    contractSubmissionDto: ContractSubmissionDto,
    sourceFiles: Array<Express.Multer.File>,
  ): Promise<ContractSubmissionResponseDto> {
    const contractSubmission = new ContractSubmission();
    contractSubmission.contractId = contractId;
    contractSubmission.license = contractSubmissionDto.license;
    contractSubmission.compiler = contractSubmissionDto.compiler;
    contractSubmission.entryFile = contractSubmissionDto.entryFile;
    contractSubmission.sourceFiles = [];

    for (const file of sourceFiles) {
      const sourceFile = new ContractSubmissionSourceFile();
      sourceFile.filePath = file.originalname;
      sourceFile.content = file.buffer.toString();
      contractSubmission.sourceFiles.push(sourceFile);
    }

    const submittedContract =
      await this.contractSubmissionsRepository.save(contractSubmission);
    const contractSubmissionResponseDto = new ContractSubmissionResponseDto();

    contractSubmissionResponseDto.submissionId = submittedContract.id;
    return contractSubmissionResponseDto;
  }

  findAll() {
    return this.contractSubmissionsRepository.find();
  }

  findOne(id: string) {
    return `This action returns a #${id} contract`;
  }
}
