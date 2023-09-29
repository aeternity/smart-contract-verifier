import { IsNotEmpty } from 'class-validator';

export class ContractSubmissionDto {
  @IsNotEmpty()
  license: string;

  @IsNotEmpty()
  compiler: string;

  @IsNotEmpty()
  entryFile: string;
}
