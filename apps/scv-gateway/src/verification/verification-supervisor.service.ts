import { Injectable } from '@nestjs/common';
import { VerificationNotificationDto } from './dto/verification-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractSubmission } from '../contracts/entities/contract-submission.entity';
import { ContractVerificationRecord } from './entities/contract-verification-record.entity';
import { VerificationStatus } from './verification.types';
import { ContractsService } from '../contracts/contracts.service';

@Injectable()
export class VerificationSupervisorService {
  constructor(
    @InjectRepository(ContractSubmission)
    private readonly contractSubmissionsRepository: Repository<ContractSubmission>,
    @InjectRepository(ContractVerificationRecord)
    private readonly contractVerificationHistoryRepository: Repository<ContractVerificationRecord>,
    private readonly contractsService: ContractsService,
  ) {}

  async processNotification(
    contractId: string,
    notification: VerificationNotificationDto,
  ) {
    const submission = await this.contractSubmissionsRepository.findOneOrFail({
      where: {
        id: notification.submissionId,
        contractId: contractId,
      },
    });

    let newStatus: VerificationStatus;

    switch (notification.status) {
      case 'processing':
        newStatus = VerificationStatus.PROCESSING;
        await this.contractSubmissionsRepository.update(submission.id, {
          status: newStatus,
          retryAfter: new Date(Date.now() + 1000 * 60 * 30),
        });
        break;
      case 'success':
        try {
          newStatus = VerificationStatus.SUCCESS;
          await this.contractSubmissionsRepository.update(submission.id, {
            status: newStatus,
          });
          await this.contractsService.confirmSubmission(submission.id, {
            aci: notification.result,
            initCallParameters: notification.initCallParameters,
          });
        } catch (error) {
          console.error(
            'Unable to save a successful contract verification. Perhaps it was submited multiple times before verification was executed?',
            error,
          );
          newStatus = VerificationStatus.FAIL;
          await this.contractSubmissionsRepository.update(submission.id, {
            status: newStatus,
            result:
              'We were unable to save the verification result. Please try again later.',
          });
        }
        break;
      case 'fail':
        newStatus = VerificationStatus.FAIL;
        await this.contractSubmissionsRepository.update(submission.id, {
          status: newStatus,
          result: notification.result,
        });
        break;
      default:
        throw new Error(
          'Unexpected verification status: ' + JSON.stringify(notification),
        );
    }

    await this.contractVerificationHistoryRepository.save({
      submissionId: notification.submissionId,
      prevStatus: submission.status,
      newStatus: newStatus,
      result: notification.result,
      source: notification?.source,
    });
  }

  // cron
  async monitorVerificationExecution(): Promise<void> {
    // get processing submissions
    // reschedule submissions if they timed out
  }

  // cron
  async clearStaleVerificationHistory(): Promise<void> {
    // delete old records
  }
}
