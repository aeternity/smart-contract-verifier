import { Controller, Get } from '@nestjs/common';
import { CompilersListDto } from './dto/compilers-list.dto';
import { SUPPORTED_COMPILERS } from './verification.const';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class CompilersController {
  @Get('/compilers')
  @ApiOperation({ summary: 'List compilers supported by the service' })
  @ApiOkResponse({
    type: CompilersListDto,
    description: 'List of supported compilers',
  })
  async getCompilers(): Promise<CompilersListDto> {
    return {
      compilers: SUPPORTED_COMPILERS,
    };
  }
}
