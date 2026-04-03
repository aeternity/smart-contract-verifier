import { VerificationStatus } from '../verification.types';

export type VerificationNotificationDto = {
  submissionId: string;
  status: VerificationStatus;
  result?: string;
  initCallParameters?: string; // parameters get decoded during successful verification
  compiler?: string; // auto-detected from bytecode
  source?: string;
};
