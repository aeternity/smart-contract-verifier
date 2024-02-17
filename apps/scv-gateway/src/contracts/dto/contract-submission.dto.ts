import { IsNotEmpty, IsIn, Validate } from 'class-validator';
import { SUPPORTED_LICENSES } from '../contracts.const';
import { SUPPORTED_COMPILERS } from '../../verification/verification.const';
import { ContractFilenameValidator } from '../validators/contract-filename.validator';

export class ContractSubmissionDto {
  @IsNotEmpty()
  @IsIn(SUPPORTED_LICENSES)
  license: (typeof SUPPORTED_LICENSES)[number];

  @IsNotEmpty()
  @IsIn(SUPPORTED_COMPILERS)
  compiler: (typeof SUPPORTED_COMPILERS)[number];

  @IsNotEmpty()
  @Validate(ContractFilenameValidator)
  entryFile: string;
}
