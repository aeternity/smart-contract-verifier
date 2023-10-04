import { IsNotEmpty, IsUUID, Validate } from 'class-validator';
import { ContractIdValidator } from '../validators/contract-id.validator';

export class ContractSubmissionStatusRequestDto {
  @IsNotEmpty()
  @Validate(ContractIdValidator)
  id: string;

  @IsUUID()
  submissionId: string;
}
