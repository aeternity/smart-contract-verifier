import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractSubmissionDto } from './dto/contract-submission.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Body() contractSubmissionDto: ContractSubmissionDto) {
    return this.contractsService.submit(contractSubmissionDto);
  }

  @Get()
  findAll() {
    return this.contractsService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.contractsService.findOne(+id);
  // }
}
