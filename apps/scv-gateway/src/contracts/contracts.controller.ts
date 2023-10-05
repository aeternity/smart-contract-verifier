import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ContractsService } from './contracts.service';
import { ContractSubmissionDto } from './dto/contract-submission.dto';
import { ApiBody, ApiConsumes, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ContractFilesValidator } from './validators/contract-files.validator';
import { ContractIdDto } from './dto/contract-id.dto';
import { ContractSubmissionStatusDto } from './dto/contract-submission-status.dto';
import { VerificationStatus } from './entities/contract-submission.entity';
import { ContractSubmissionStatusRequestDto } from './dto/contract-submission-status-request.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post(':contractId')
  @ApiParam({ name: 'contractId', type: String })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Contract submitted for verification',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Contract source files issues',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Paylaod requirements not met',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        license: { type: 'string' },
        compiler: { type: 'string' },
        entryFile: { type: 'string' },
        sourceFiles: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('sourceFiles'))
  submit(
    @Param() params: ContractIdDto,
    @Body() contractSubmissionDto: ContractSubmissionDto,
    @UploadedFiles() sourceFiles: Array<Express.Multer.File>,
  ) {
    try {
      ContractFilesValidator.validate(contractSubmissionDto, sourceFiles);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error.message,
        },
      );
    }

    return this.contractsService.submit(
      params.contractId,
      contractSubmissionDto,
      sourceFiles,
    );
  }

  @Get(':id/check/:submissionId')
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'submissionId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract is still pending or verified successfully',
    type: ContractSubmissionStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract or submission matching that contract not found',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Contract verification failed',
    type: ContractSubmissionStatusDto,
  })
  async checkSubmissionStatus(
    @Param() params: ContractSubmissionStatusRequestDto,
    @Res() res: Response,
  ) {
    const verificationStatus =
      await this.contractsService.checkSubmissionStatus(
        params.id,
        params.submissionId,
      );

    if (verificationStatus.status === VerificationStatus.FAIL) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY);
    } else {
      res.status(HttpStatus.OK);
    }

    res.json(verificationStatus);
  }
}
