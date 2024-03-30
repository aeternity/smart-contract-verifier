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
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ContractsService } from './contracts.service';
import { ContractSubmissionDto } from './dto/contract-submission.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
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
import * as path from 'path';
import { ErrorDto } from '../shared/dto/error.dto';
import { SUPPORTED_LICENSES } from './contracts.const';
import { SUPPORTED_COMPILERS } from '../verification/verification.const';
import { ContractSubmissionResponseDto } from './dto/contract-submission-response.dto';

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
  @ApiOperation({
    summary:
      'Submit a contract for verification. If verified successfuly, the source code will be stored and made publicly available.',
  })
  @ApiParam({
    name: 'contractId',
    type: 'string',
    example: 'ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa',
    description:
      'The blockchain id of the contract to be submitted for verification',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Contract was successfully submitted for verification.',
    type: ContractSubmissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Contract source files issues',
    type: ErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Paylaod requirements not met',
    type: ErrorDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        license: {
          type: 'string',
          example: 'MIT',
          enum: SUPPORTED_LICENSES,
          description:
            'License describing the usage rights of the contract source code',
        },
        compiler: {
          type: 'string',
          enum: SUPPORTED_COMPILERS,
          example: SUPPORTED_COMPILERS[0],
          description: 'aesophia compiler version used to compile the contract',
        },
        entryFile: {
          type: 'string',
          description: 'The name of the main file of the contract source code',
          example: 'my_contract.aes',
        },
        recaptchaToken: {
          type: 'string',
          description:
            'Recaptcha token is mandatory only if recaptchaSecret was configured in the service configuration',
        },
        sourceFiles: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['license', 'compiler', 'entryFile', 'sourceFiles'],
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
        if (error instanceof HttpException) {
          throw error;
        }

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
  @ApiOperation({
    summary: 'Get verification information about a verified contract.',
  })
  @ApiParam({
    name: 'contractId',
    type: 'string',
    example: 'ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa',
    description:
      'The blockchain id of the contract to check the verification data of',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract is verified',
    type: VerifiedContractDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract is not found or not verified',
    type: ErrorDto,
  })
  async getVerifiedContract(@Param('contractId') contractId: string) {
    return this.contractsService.getVerifiedContract(contractId);
  }

  @Get('/')
  @ApiOperation({
    summary:
      'Get verification batch information about several verified contracts.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Some of the requested contracts are verified',
    type: VerifiedContractDto,
  })
  @ApiQuery({
    name: 'ids',
    type: 'string',
    isArray: true,
    required: true,
    description:
      'The blockchain ids of the contracts to check the verification data of',
    example: ['ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa'],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'None of the requested contracts are verified',
    type: ErrorDto,
  })
  async getVerifiedContracts(
    @Query('ids') contractIds: string[],
  ): Promise<Contracts> {
    return {
      contracts: await this.contractsService.getVerifiedContracts(contractIds),
    };
  }

  @Get('/:contractId/source')
  @ApiOperation({ summary: 'Get verified contract source code.' })
  @ApiParam({
    name: 'contractId',
    type: 'string',
    example: 'ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa',
    description: 'The blockchain id of the contract to get the source code of',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Contract source code is available. Can be returned as a json or a zip file',
    type: ContractSourceFiles,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract is not found or not verified',
    type: ErrorDto,
  })
  @ApiQuery({
    name: 'zip',
    type: Boolean,
    description: 'Return source code as a zip file',
    required: false,
  })
  async getVerifiedContractSource(
    @Res() res: Response,
    @Param('contractId') contractId: string,
    @Query('zip') zip?: string,
  ): Promise<ContractSourceFiles | StreamableFile> {
    if (zip && ['true', '1'].includes(zip)) {
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${contractId}.zip"`,
      });
      await this.contractsService.getVerifiedContractSource(
        contractId,
        zip && ['true', '1'].includes(zip) ? true : (false as any),
        res,
      );
      return;
    }

    res.set({
      'Content-Type': 'application/json',
    });
    res.status(HttpStatus.OK);
    res.send({
      source: await this.contractsService.getVerifiedContractSource(contractId),
    });
  }

  @Get('/:contractId/source/file')
  @ApiOperation({
    summary: 'Get single source code file of a verified contract.',
  })
  @ApiParam({
    name: 'contractId',
    type: 'string',
    example: 'ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa',
    description: 'The blockchain id of the contract to get the source code of',
  })
  @ApiQuery({
    name: 'path',
    type: 'string',
    example: 'contracts/my_contract.aes',
    description: 'The path of the file to get the source code of',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract source file specified by the path',
    type: ContractSourceFiles,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract is not found or not verified or file not found',
    type: ErrorDto,
  })
  async getVerifiedContractSourceFile(
    @Res({ passthrough: true }) res: Response,
    @Param('contractId') contractId: string,
    @Query('path') filePath: string,
  ): Promise<StreamableFile> {
    const file = await this.contractsService.getVerifiedContractSourceFile(
      contractId,
      filePath,
    );

    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${path.basename(
        filePath,
      )}"`,
    });

    return new StreamableFile(file);
  }

  @Get(':contractId/check/:submissionId')
  @ApiOperation({
    summary: 'Check progress and/or results of a contract verification.',
  })
  @ApiParam({
    name: 'contractId',
    type: 'string',
    example: 'ct_J3zBY8xxjsRr3QojETNw48Eb38fjvEuJKkQ6KzECvubvEcvCa',
    description:
      'The blockchain id of the contract to check the verification progress of',
  })
  @ApiParam({
    name: 'submissionId',
    type: String,
    description:
      'UUID of the submission that may be used to query the status of the submission',
    example: 'd3b3b3b3-3b3b-3b3b-3b3b-3b3b3b3b3b3b',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract is still pending or verification is finished',
    type: ContractSubmissionStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract or submission matching that contract not found',
    type: ErrorDto,
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
