import { ApiProperty } from '@nestjs/swagger';
import { SUPPORTED_LICENSES } from '../contracts.const';
import { SUPPORTED_COMPILERS } from '../../verification/verification.const';

export class VerifiedContractDto {
  @ApiProperty()
  contractId: string;

  @ApiProperty()
  license: (typeof SUPPORTED_LICENSES)[number];

  @ApiProperty()
  compiler: (typeof SUPPORTED_COMPILERS)[number];

  @ApiProperty()
  initCallParameters: string;

  @ApiProperty()
  entryFile: string;

  @ApiProperty()
  aci: string;

  @ApiProperty()
  verifiedAt: Date;
}
