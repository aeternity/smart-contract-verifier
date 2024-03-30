import { Test, TestingModule } from '@nestjs/testing';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';
import { ContractFilesValidator } from './validators/contract-files.validator';

describe('ContractsController', () => {
  let controller: ContractsController;

  const httpService = {
    get: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };
  const contractsService = {
    submit: jest.fn(),
  };

  const validateMock = jest.fn();

  ContractFilesValidator.validate = validateMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
        { provide: ContractsService, useValue: contractsService },
      ],
    }).compile();

    controller = module.get<ContractsController>(ContractsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submit', () => {
    it('returns error when recaptcha is active and external recaptcha service is down', async () => {
      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ recaptchaSecret: 'mock' });
      httpService.get.mockReturnValue(throwError('recaptcha service down'));
      const submitRequest = controller.submit(
        { contractId: 'ct_12345' },
        {
          license: 'MIT',
          compiler: '1.2.3',
          entryFile: 'main.aes',
          recaptchaToken: 'invalid',
        },
        [],
      );
      expect(submitRequest).rejects.toThrowError();
    });

    it('returns error when recaptcha is active and code is not provided', async () => {
      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ recaptchaSecret: 'mock' });
      const submitRequest = controller.submit(
        { contractId: 'ct_12345' },
        { license: 'MIT', compiler: '1.2.3', entryFile: 'main.aes' },
        [],
      );
      expect(submitRequest).rejects.toThrowError();
    });

    it('return error when recaptcha is active and provided code is invalid', async () => {
      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ recaptchaSecret: 'mock' });
      httpService.get.mockReturnValue(of({ data: { success: false } }));
      const submitRequest = controller.submit(
        { contractId: 'ct_12345' },
        {
          license: 'MIT',
          compiler: '1.2.3',
          entryFile: 'main.aes',
          recaptchaToken: 'invalid',
        },
        [],
      );
      expect(submitRequest).rejects.toThrowError();
    });

    it('return error when recaptcha is active and provided code score is too low', async () => {
      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ recaptchaSecret: 'mock' });
      httpService.get.mockReturnValue(
        of({ data: { success: true, score: 0.1 } }),
      );
      const submitRequest = controller.submit(
        { contractId: 'ct_12345' },
        {
          license: 'MIT',
          compiler: '1.2.3',
          entryFile: 'main.aes',
          recaptchaToken: 'invalid',
        },
        [],
      );
      expect(submitRequest).rejects.toThrowError();
    });

    it('return error when contract files validation fails', async () => {
      when(configService.get).calledWith('app').mockReturnValue({});
      validateMock.mockImplementation(() => {
        throw new Error('validation failed');
      });
      const submitRequest = controller.submit(
        { contractId: 'ct_12345' },
        {
          license: 'MIT',
          compiler: '1.2.3',
          entryFile: 'main.aes',
          recaptchaToken: 'invalid',
        },
        [],
      );
      expect(submitRequest).rejects.toThrowError();
    });

    it('returns submission id when all checks pass', async () => {
      when(configService.get).calledWith('app').mockReturnValue({});
      validateMock.mockReturnValue(undefined);
      contractsService.submit.mockReturnValue({
        submissionId: 'submission_id',
      });
      const submitRequest = controller.submit(
        { contractId: 'ct_12345' },
        { license: 'MIT', compiler: '1.2.3', entryFile: 'main.aes' },
        [],
      );
      expect(submitRequest).resolves.toEqual({ submissionId: 'submission_id' });
    });
  });
});
