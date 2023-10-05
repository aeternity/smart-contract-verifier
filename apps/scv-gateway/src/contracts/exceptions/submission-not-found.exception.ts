import { HttpException, HttpStatus } from '@nestjs/common';

export class SubmissionNotFoundException extends HttpException {
  constructor(submissionId: string, contractId: string | undefined) {
    if (!contractId) {
      super(`Submission ${submissionId} was not found`, HttpStatus.NOT_FOUND);
      return;
    }
    super(
      `Submission ${submissionId} was not found for contract ${contractId}`,
      HttpStatus.NOT_FOUND,
    );
  }
}
