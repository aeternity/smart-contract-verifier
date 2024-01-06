import { ApiProperty } from '@nestjs/swagger';

export class CompilersListDto {
  @ApiProperty()
  compilers: string[];
}
