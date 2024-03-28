import { ApiProperty } from '@nestjs/swagger';
import { SUPPORTED_LICENSES } from '../contracts.const';
import { SUPPORTED_COMPILERS } from '../../verification/verification.const';

export class VerifiedContractDto {
  @ApiProperty({
    example: 'ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa',
    description:
      'The blockchain id of the contract to be submitted for verification',
  })
  contractId: string;

  @ApiProperty({
    example: 'MIT',
    enum: SUPPORTED_LICENSES,
    description:
      'License describing the usage rights of the contract source code',
  })
  license: (typeof SUPPORTED_LICENSES)[number];

  @ApiProperty({
    enum: SUPPORTED_COMPILERS,
    example: SUPPORTED_COMPILERS[0],
    description: 'aesophia compiler version used to compile the contract',
  })
  compiler: (typeof SUPPORTED_COMPILERS)[number];

  @ApiProperty({
    description: 'Parameters used to initialize the contract',
    example: 'init(1, 2, 3)',
  })
  initCallParameters: string;

  @ApiProperty({
    description: 'The name of the main file of the contract source code',
    example: 'my_contract.aes',
  })
  entryFile: string;

  @ApiProperty({
    type: 'string',
    example: '[{"namespace":{"name":"MyContract","typedefs":[]...}}]',
  })
  aci: string;

  @ApiProperty()
  verifiedAt: Date;
}
