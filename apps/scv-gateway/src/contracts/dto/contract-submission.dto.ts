import { IsNotEmpty, IsIn, Validate } from 'class-validator';
import { SUPPORTED_LICENSES } from '../contracts.const';
import { ContractFilenameValidator } from '../validators/contract-filename.validator';

export class ContractSubmissionDto {
  @IsNotEmpty()
  @IsIn(SUPPORTED_LICENSES)
  license: (typeof SUPPORTED_LICENSES)[number];

  @IsNotEmpty()
  @Validate(ContractFilenameValidator)
  entryFile: string;

  recaptchaToken?: string;
}
