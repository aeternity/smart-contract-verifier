import { ApiProperty } from '@nestjs/swagger';

export class ContractSourceFileDto {
  @ApiProperty({
    description: 'The path of the file',
    example: 'contracts/my_contract.aes',
  })
  filePath: string;

  @ApiProperty({
    description: 'The content of the file',
    example: 'contract MyContract =\n  entrypoint init() = ()',
  })
  content: string;

  @ApiProperty({
    description: 'Flag indicating if the file is the main file of the contract',
    example: false,
  })
  isEntryFile: boolean;
}
