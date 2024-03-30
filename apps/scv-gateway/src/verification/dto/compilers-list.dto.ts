import { ApiProperty } from '@nestjs/swagger';
import { SUPPORTED_COMPILERS } from '../verification.const';

export class CompilersListDto {
  @ApiProperty({
    description: 'List of supported compilers',
    type: 'string',
    isArray: true,
    example: SUPPORTED_COMPILERS,
  })
  compilers: string[];
}
