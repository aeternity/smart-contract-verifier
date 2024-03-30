import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ContractsService } from './contracts.service';
import { ContractSubmission } from './entities/contract-submission.entity';
import { Contract } from './entities/contract.entity';
import { ContractSubmissionDto } from './dto/contract-submission.dto';
import { ContractSubmissionResponseDto } from './dto/contract-submission-response.dto';
import { of, throwError } from 'rxjs';
import { when } from 'jest-when';
describe('ContractsService', () => {
  let service: ContractsService;
  const contractRepository = {
    findOne: jest.fn(),
  };
  const contractSubmissionsRepository = {
    save: jest.fn(),
  };

  const httpService = {
    get: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: getRepositoryToken(ContractSubmission),
          useValue: contractSubmissionsRepository,
        },
        {
          provide: getRepositoryToken(Contract),
          useValue: contractRepository,
        },
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submit', () => {
    it('throws error if contract has been already verified', async () => {
      const contractSubmissionDto: ContractSubmissionDto = {
        compiler: '1.2.3',
        entryFile: 'main.aes',
        license: 'MIT',
      };
      const sourceFiles: Array<Express.Multer.File> = [];

      contractRepository.findOne.mockResolvedValueOnce({});

      const result: Promise<ContractSubmissionResponseDto> = service.submit(
        'contractId',
        contractSubmissionDto,
        sourceFiles,
      );

      expect(result).rejects.toThrowError();
    });

    it('throws error if contract has been already verified', async () => {
      const contractSubmissionDto: ContractSubmissionDto = {
        compiler: '1.2.3',
        entryFile: 'main.aes',
        license: 'MIT',
      };
      const sourceFiles: Array<Express.Multer.File> = [];

      contractRepository.findOne.mockResolvedValueOnce(null);
      httpService.get.mockReturnValue(throwError('Contract not found'));

      const result: Promise<ContractSubmissionResponseDto> = service.submit(
        'contractId',
        contractSubmissionDto,
        sourceFiles,
      );

      expect(result).rejects.toThrowError();
    });

    it('returns saves contract submission and returns its id', async () => {
      const contractSubmissionDto: ContractSubmissionDto = {
        compiler: '1.2.3',
        entryFile: 'main.aes',
        license: 'MIT',
      };
      const sourceFiles: Array<Express.Multer.File> = [
        {
          originalname: 'file1.aes',
          buffer: Buffer.from('mock data'),
        } as any,
      ];

      contractRepository.findOne.mockResolvedValueOnce(null);
      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ aeMdwUrl: 'https://ae-mdw' });
      httpService.get.mockReturnValue(
        of({
          data: {
            create_tx: { code: 'mock code', call_data: 'mock data' },
          },
        }),
      );
      contractSubmissionsRepository.save.mockResolvedValueOnce({
        id: 'submissionId',
      });

      const result: ContractSubmissionResponseDto = await service.submit(
        'contractId',
        contractSubmissionDto,
        sourceFiles,
      );

      expect(result).toEqual({ submissionId: 'submissionId' });
    });
  });
});
