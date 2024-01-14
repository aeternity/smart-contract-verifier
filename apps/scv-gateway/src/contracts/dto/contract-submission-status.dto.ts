import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '../../verification/verification.types';

export class ContractSubmissionStatusDto {
  @ApiProperty({
    enum: VerificationStatus,
  })
  status: VerificationStatus;

  @ApiProperty({
    required: false,
    description: 'Error message if status is FAIL',
  })
  message?: string;
}
