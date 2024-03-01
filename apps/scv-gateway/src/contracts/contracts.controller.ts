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
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ContractsService } from './contracts.service';
import { ContractSubmissionDto } from './dto/contract-submission.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ContractFilesValidator } from './validators/contract-files.validator';
import { ContractIdDto } from './dto/contract-id.dto';
import { ContractSubmissionStatusDto } from './dto/contract-submission-status.dto';
import { ContractSubmissionStatusRequestDto } from './dto/contract-submission-status-request.dto';
import { VerifiedContractDto } from './dto/verified-contract.dto';
import { ContractSourceFileDto } from './dto/contract-source-file.dto';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AllConfigType, AppConfig } from '../config/config.type';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

class ContractSourceFiles {
  @ApiProperty({ type: [ContractSourceFileDto] })
  source: ContractSourceFileDto[];
}

class Contracts {
  @ApiProperty({ type: [VerifiedContractDto] })
  contracts: VerifiedContractDto[];
}

@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
  ) {}

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
        recaptchaToken: { type: 'string' },
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
  @UseInterceptors(
    FilesInterceptor('sourceFiles', 1000, { preservePath: true }),
  )
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async submit(
    @Param() params: ContractIdDto,
    @Body() contractSubmissionDto: ContractSubmissionDto,
    @UploadedFiles() sourceFiles: Array<Express.Multer.File>,
  ) {
    if (this.configService.get<AppConfig>('app').recaptchaSecret) {
      if (!contractSubmissionDto.recaptchaToken) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: ['Recaptcha token is required'],
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      try {
        const response = await firstValueFrom(
          this.httpService.get(
            `https://www.google.com/recaptcha/api/siteverify?secret=${
              this.configService.get<AppConfig>('app').recaptchaSecret
            }&response=${contractSubmissionDto?.recaptchaToken}`,
          ),
        );
        if (!response.data.success) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: ['Recaptcha token is invalid'],
            },
            HttpStatus.BAD_REQUEST,
          );
        } else if (response.data.score < 0.5) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: ['Recaptcha token score is too low'],
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      } catch (error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: ['Recaptcha token verification was not successful'],
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    try {
      ContractFilesValidator.validate(contractSubmissionDto, sourceFiles);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: [error.message],
        },
        HttpStatus.BAD_REQUEST,
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

  @Get(':contractId')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract is verified',
    type: VerifiedContractDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract is not found or not verified',
  })
  async getVerifiedContract(@Param('contractId') contractId: string) {
    return this.contractsService.getVerifiedContract(contractId);
  }

  @Get('/')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Some of the requested contracts are verified',
    type: VerifiedContractDto,
  })
  @ApiQuery({
    name: 'ids',
    type: [String],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'None of the requested contracts are verified',
  })
  async getVerifiedContracts(
    @Query('ids') contractIds: string[],
  ): Promise<Contracts> {
    return {
      contracts: await this.contractsService.getVerifiedContracts(contractIds),
    };
  }

  @Get('/:contractId/source')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract source code is available',
    type: ContractSourceFiles,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract is not found or not verified',
  })
  async getVerifiedContractSource(
    @Param('contractId') contractId: string,
  ): Promise<ContractSourceFiles> {
    return {
      source: await this.contractsService.getVerifiedContractSource(contractId),
    };
  }

  @Get(':id/check/:submissionId')
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'submissionId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract is still pending or verification is finished',
    type: ContractSubmissionStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract or submission matching that contract not found',
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

    res.status(HttpStatus.OK);
    res.json(verificationStatus);
  }
}
