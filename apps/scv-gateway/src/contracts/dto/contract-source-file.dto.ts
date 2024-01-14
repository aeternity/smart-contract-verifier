import { ApiProperty } from '@nestjs/swagger';

export class ContractSourceFileDto {
  @ApiProperty()
  filePath: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  isEntryFile: boolean;
}
