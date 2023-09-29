import { IsNotEmpty, Validate } from 'class-validator';
import { ContractIdValidator } from '../validators/contract-id.validator';

export class ContractIdDto {
  @IsNotEmpty()
  @Validate(ContractIdValidator)
  contractId: string;
}
