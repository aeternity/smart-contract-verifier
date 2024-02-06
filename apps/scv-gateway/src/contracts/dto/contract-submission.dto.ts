import { IsNotEmpty, IsIn } from 'class-validator';
import { SUPPORTED_LICENSES } from '../contracts.const';
import { SUPPORTED_COMPILERS } from '../../verification/verification.const';

export class ContractSubmissionDto {
  @IsNotEmpty()
  @IsIn(SUPPORTED_LICENSES)
  license: (typeof SUPPORTED_LICENSES)[number];

  @IsNotEmpty()
  @IsIn(SUPPORTED_COMPILERS)
  compiler: (typeof SUPPORTED_COMPILERS)[number];

  @IsNotEmpty()
  entryFile: string;
}
