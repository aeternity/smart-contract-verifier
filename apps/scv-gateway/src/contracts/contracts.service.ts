import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContractSubmissionDto } from './dto/contract-submission.dto';
import { ContractSubmission } from './entities/contract-submission.entity';
import { ContractSubmissionSourceFile } from './entities/contract-submission-source-file.entity';
import { ContractSubmissionResponseDto } from './dto/contract-submission-response.dto';
import { SubmissionNotFoundException } from './exceptions/submission-not-found.exception';
import { ContractSubmissionStatusDto } from './dto/contract-submission-status.dto';
import { VerificationStatus } from '../verification/verification.types';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Contract } from './entities/contract.entity';
import { ContractSourceFile } from './entities/contract-source-file.entity';
import { VerifiedContractDto } from './dto/verified-contract.dto';
import { ContractSourceFileDto } from './dto/contract-source-file.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractSubmission)
    private contractSubmissionsRepository: Repository<ContractSubmission>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async submit(
    contractId: string,
    contractSubmissionDto: ContractSubmissionDto,
    sourceFiles: Array<Express.Multer.File>,
  ): Promise<ContractSubmissionResponseDto> {
    if (
      await this.contractRepository.findOne({
        where: {
          contractId,
        },
      })
    ) {
      throw new HttpException(
        'This contract has already been verified.',
        HttpStatus.CONFLICT,
      );
    }

    const contractSubmission = new ContractSubmission();
    contractSubmission.contractId = contractId;
    contractSubmission.license = contractSubmissionDto.license;
    contractSubmission.compiler = contractSubmissionDto.compiler;
    contractSubmission.entryFile = contractSubmissionDto.entryFile;
    contractSubmission.sourceFiles = [];

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${
            this.configService.get('app').aeMdwUrl
          }/v2/contracts/${contractId}`,
        ),
      );
      contractSubmission.bytecode = response.data.create_tx.code;
      contractSubmission.encodedInitCallParameters =
        response.data.create_tx.call_data;
    } catch (error) {
      throw new HttpException(
        "Couldn't fetch contract bytecode. Most likely the provided contract is not available in the network, or the Node API is down.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

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

  async checkSubmissionStatus(
    contractId: string,
    submissionId: string,
  ): Promise<ContractSubmissionStatusDto> {
    const submission = await this.contractSubmissionsRepository.findOne({
      where: {
        id: submissionId,
        contractId,
      },
    });

    if (!submission) {
      throw new SubmissionNotFoundException(submissionId, contractId);
    }

    const contractSubmissionStatusDto = new ContractSubmissionStatusDto();
    contractSubmissionStatusDto.status = submission.status;

    if (submission.status === VerificationStatus.FAIL) {
      contractSubmissionStatusDto.message = submission.result;
    }

    return contractSubmissionStatusDto;
  }

  async getVerifiedContract(contractId: string): Promise<VerifiedContractDto> {
    const contract = await this.contractRepository.findOne({
      where: {
        contractId,
      },
    });

    if (!contract) {
      throw new HttpException('Contract not found.', HttpStatus.NOT_FOUND);
    }

    const contractDto: VerifiedContractDto = {
      contractId: contract.contractId,
      compiler: contract.compiler,
      entryFile: contract.entryFile,
      license: contract.license,
      aci: contract.aci,
      initCallParameters: contract.initCallParameters,
      verifiedAt: contract.verifiedAt,
    };

    return contractDto;
  }

  async getVerifiedContracts(
    contractIds: string[],
  ): Promise<VerifiedContractDto[]> {
    const contracts = await this.contractRepository.find({
      where: {
        contractId: In(contractIds),
      },
    });

    if (contracts.length === 0) {
      throw new HttpException(
        'None of the contracts are verified',
        HttpStatus.NOT_FOUND,
      );
    }

    return contracts.map((contract) => {
      const contractDto: VerifiedContractDto = {
        contractId: contract.contractId,
        compiler: contract.compiler,
        entryFile: contract.entryFile,
        license: contract.license,
        aci: contract.aci,
        initCallParameters: contract.initCallParameters,
        verifiedAt: contract.verifiedAt,
      };
      return contractDto;
    });
  }

  async getVerifiedContractSource(
    contractId: string,
  ): Promise<ContractSourceFileDto[]> {
    const contract = await this.contractRepository.findOne({
      where: {
        contractId,
      },
      relations: {
        sourceFiles: true,
      },
    });

    if (!contract) {
      throw new HttpException('Contract not found.', HttpStatus.NOT_FOUND);
    }

    const sourceFiles: ContractSourceFileDto[] = [];

    for (const sourceFile of contract.sourceFiles) {
      const sourceFileDto: ContractSourceFileDto = {
        filePath: sourceFile.filePath,
        content: sourceFile.content,
        isEntryFile: sourceFile.filePath === contract.entryFile,
      };

      sourceFiles.push(sourceFileDto);
    }

    return sourceFiles;
  }

  async confirmSubmission(
    submissionId,
    { aci, initCallParameters }: { aci: string; initCallParameters: string },
  ) {
    const submission = await this.contractSubmissionsRepository.findOne({
      where: {
        id: submissionId,
      },
      relations: {
        sourceFiles: true,
      },
    });

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found.`);
    }

    if (submission.status !== VerificationStatus.SUCCESS) {
      throw new Error(
        `Submission ${submissionId} is not in SUCCESS state, but ${submission.status}.`,
      );
    }

    const contract = await this.convertSubmissionToContract(submission, {
      aci,
      initCallParameters,
    });

    await this.contractRepository.save(contract);
  }

  private async convertSubmissionToContract(
    submission: ContractSubmission,
    { aci, initCallParameters }: { aci: string; initCallParameters: string },
  ): Promise<Contract> {
    const contract = new Contract();

    contract.contractId = submission.contractId;
    contract.compiler = submission.compiler;
    contract.entryFile = submission.entryFile;
    contract.license = submission.license;
    contract.bytecode = submission.bytecode;
    contract.initCallParameters = initCallParameters;
    contract.encodedInitCallParameters = submission.encodedInitCallParameters;
    contract.aci = aci;
    contract.sourceFiles = submission.sourceFiles.map((sourceFile) => {
      const contractSourceFile = new ContractSourceFile();
      contractSourceFile.filePath = sourceFile.filePath;
      contractSourceFile.content = sourceFile.content;

      return contractSourceFile;
    });

    return contract;
  }
}
