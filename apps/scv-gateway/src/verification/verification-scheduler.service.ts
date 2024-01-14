import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractSubmission } from '../contracts/entities/contract-submission.entity';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { VerificationStatus } from './verification.types';
import { ClientProxy } from '@nestjs/microservices';
import { VerificationTaskDto } from './dto/verification-task.dto';
import { ContractVerificationRecord } from './entities/contract-verification-record.entity';

@Injectable()
export class VerificationSchedulerService {
  private readonly logger = new Logger(VerificationSchedulerService.name);

  constructor(
    @InjectRepository(ContractSubmission)
    private readonly contractSubmissionsRepository: Repository<ContractSubmission>,
    @InjectRepository(ContractVerificationRecord)
    private readonly contractVerificationHistoryRepository: Repository<ContractVerificationRecord>,
    @Inject('MQ_SERVICE')
    private readonly mqClient: ClientProxy,
  ) {}

  @Cron('*/30 * * * * *')
  async scheduleVerification(): Promise<void> {
    this.logger.debug('Checking verification submissions.');
    const submissions = await this.contractSubmissionsRepository.find({
      where: [
        {
          status: VerificationStatus.NEW,
        },
        {
          status: VerificationStatus.FAIL_RETRY,
          retryAfter: new Date(Date.now()),
        },
      ],
      relations: {
        sourceFiles: true,
      },
    });

    if (!submissions.length) {
      this.logger.debug('No new submissions found.');
      return;
    }

    this.logger.debug(
      `Found ${submissions.length} new submissions. Scheduling them for verification.`,
    );

    for (const submission of submissions) {
      const verificationTask: VerificationTaskDto = {
        submissionId: submission.id,
        contractId: submission.contractId,
        compiler: submission.compiler,
        entryFile: submission.entryFile,
        bytecode: submission.bytecode,
        encodedInitCallParameters: submission.encodedInitCallParameters,
        sourceFiles: submission.sourceFiles.map((file) => ({
          filePath: file.filePath,
          content: file.content,
        })),
      };

      const mqResult = await this.mqClient.emit(
        'verification-task',
        verificationTask,
      );
      await mqResult.subscribe();
      await this.contractVerificationHistoryRepository.save({
        submissionId: submission.id,
        prevStatus: submission.status,
        newStatus: VerificationStatus.PENDING,
      });
      submission.status = VerificationStatus.PENDING;
      await this.contractSubmissionsRepository.save(submission);
    }
  }
}
