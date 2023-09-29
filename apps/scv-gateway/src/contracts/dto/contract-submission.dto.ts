import { IsNotEmpty, Validate } from 'class-validator';
import { ContractIdValidator } from '../validators/contract-id.validator';

export class ContractSubmissionDto {
  @IsNotEmpty()
  @Validate(ContractIdValidator)
  contractId: string;

  @IsNotEmpty()
  license: string;

  @IsNotEmpty()
  compiler: string;

  @IsNotEmpty()
  entryFile: string;
}
