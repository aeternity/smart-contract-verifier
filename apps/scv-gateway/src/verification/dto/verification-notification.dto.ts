import { VerificationStatus } from '../verification.types';

export type VerificationNotificationDto = {
  submissionId: string;
  status: VerificationStatus;
  result?: string;
  initCallParameters?: string; // parameters get decoded during successful verification
  source?: string;
};
