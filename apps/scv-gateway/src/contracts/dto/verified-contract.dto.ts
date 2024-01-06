import { ApiProperty } from '@nestjs/swagger';

export class VerifiedContractDto {
  @ApiProperty()
  contractId: string;

  @ApiProperty()
  license: string;

  @ApiProperty()
  compiler: string;

  @ApiProperty()
  initCallParameters: string;

  @ApiProperty()
  entryFile: string;

  @ApiProperty()
  aci: string;

  @ApiProperty()
  verifiedAt: Date;
}
