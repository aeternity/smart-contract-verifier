import { Test, TestingModule } from '@nestjs/testing';
import { mocked } from 'jest-mock';
import { VerificationService } from './verification.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { VerificationTaskDto } from './dto/verification-task.dto';
import { when } from 'jest-when';
import * as fs from 'fs/promises';
import { exec as execCallback } from 'child_process';

jest.mock('child_process', () => ({
  exec: jest.fn((command, cb) => cb()),
}));

jest.mock('fs/promises');
const mockedFs = mocked(fs);

const SAMPLE_RSA_KEY =
  '-----BEGIN RSA PRIVATE KEY-----\nMIICWgIBAAKBgFlekfRTWDtwLu0BlUh4VfXq3tvKvb6mPncjQ9I/tGkRRo3dojvx\nWN7B+kQxt56nGsIffKwU6N6fTCvEMVIHR0ykuRrvRusE5axYiQI2rpipv9sjDeD5\nBaHOtdF7ihjxqKQTH7oB5+rxu81zgU/TMcSqPnNgUcvClEnXJz7hmxZ9AgMBAAEC\ngYAVNc6qEAXGxY89jLyjYHv2S3Hs9CcoUkhM+j+kbJ4iuYjnLozMcTFIXP1KpgoQ\nS1ScceCi7qt9+oyXbo7OCxAupqBXK0y6FD0YxDCeZauZx5WsYDG1gxzZWn241tr9\nDdPQHbEP6xFThnsfWfKM3R/T40eIaVnROQwJmnJ0pU0MeQJBAJ6xooHV0CFzLW9e\nVdL3LfYoRhROYl7PxlcmWMj2l33X0tcWCkZLcOp7ta9Ko2dKJB+1TYunzHbMW8Lz\n+FB5Vo8CQQCQKv3qCVvq7t/uPwG9cyehALBQx3+TjhoFc04XvBgzlEhngKgxTdOq\ngslfQclLqsddnN7Yi2hJ8yPbtneVz6gzAkA3SojmV8rGfMzNyr54XKrk4y9Xj9/y\nTM48Ox4gFtq9e974FbPKvio/aI7q3kSEjm57pb249OPmWFl4WWyhDUW9AkArC6sk\n5gZ77zcNe+KZHnkGqZ37gJWnCRbb6cG3dIIFZJD51oBhuEsq7kISHyJrZWKBoQUo\nwvcwnVhnkePC523hAkBhTmPwXZXBHEu7jnO+j8CSlaQE3kd6QdT6nbp93HMzEbpz\nocxXGMBY01lPlI0UoOVlZnUmp6tfhvQjHNxh0Q8f\n-----END RSA PRIVATE KEY-----';

describe('VerificationService', () => {
  let service: VerificationService;

  const httpService = {
    get: jest.fn(),
    post: jest.fn().mockImplementation(() => of({ data: {} })),
  };
  const configService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processVerificationTask', () => {
    it('reports fail if a nested directory for source file cannot be created', async () => {
      const task: VerificationTaskDto = {
        submissionId: '11111111-1111-1111-1111-111111111111',
        contractId: 'ct_123456789',
        sourceFiles: [
          {
            filePath: 'nested/file.aes',
            content: 'mock',
          },
        ],
        bytecode: 'mock',
        compiler: 'mock',
        entryFile: 'mock',
        encodedInitCallParameters: 'mock',
      };

      mockedFs.mkdir.mockRejectedValue(
        new Error('Error during creating directory'),
      );

      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ workerId: 123, workerPrivKey: SAMPLE_RSA_KEY });
      when(configService.get)
        .calledWith('gateway-api')
        .mockReturnValue({ url: 'https://gateway-url' });

      await service.processVerificationTask(task);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://gateway-url/verification/notify/ct_123456789',
        {
          source: 123,
          submissionId: '11111111-1111-1111-1111-111111111111',
          status: 'fail',
          result: 'Processing contract files was unsuccessful.',
        },
        expect.anything(),
      );
    });

    it('reports fail if a source file cannot be created', async () => {
      const task: VerificationTaskDto = {
        submissionId: '11111111-1111-1111-1111-111111111111',
        contractId: 'ct_123456789',
        sourceFiles: [
          {
            filePath: 'file.aes',
            content: 'mock',
          },
        ],
        bytecode: 'mock',
        compiler: 'mock',
        entryFile: 'mock',
        encodedInitCallParameters: 'mock',
      };

      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockRejectedValue(
        new Error('Error during creating file'),
      );

      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ workerId: 123, workerPrivKey: SAMPLE_RSA_KEY });
      when(configService.get)
        .calledWith('gateway-api')
        .mockReturnValue({ url: 'https://gateway-url' });

      await service.processVerificationTask(task);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://gateway-url/verification/notify/ct_123456789',
        {
          source: 123,
          submissionId: '11111111-1111-1111-1111-111111111111',
          status: 'fail',
          result: 'Processing contract files was unsuccessful.',
        },
        expect.anything(),
      );
    });

    it('reports fail if there is an error during generating ACI', async () => {
      const task: VerificationTaskDto = {
        submissionId: '11111111-1111-1111-1111-111111111111',
        contractId: 'ct_123456789',
        sourceFiles: [
          {
            filePath: 'file.aes',
            content: 'mock',
          },
        ],
        bytecode: 'mock',
        compiler: 'mock',
        entryFile: 'mock',
        encodedInitCallParameters: 'mock',
      };

      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      when(mockedFs.readFile)
        .calledWith(expect.stringContaining('_result.json'))
        .mockRejectedValue(new Error('Error during reading file'))
        .calledWith(expect.anything())
        .mockResolvedValue('mock');

      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ workerId: 123, workerPrivKey: SAMPLE_RSA_KEY });
      when(configService.get)
        .calledWith('gateway-api')
        .mockReturnValue({ url: 'https://gateway-url' });

      await service.processVerificationTask(task);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://gateway-url/verification/notify/ct_123456789',
        {
          source: 123,
          submissionId: '11111111-1111-1111-1111-111111111111',
          status: 'fail',
          result:
            'Generating ACI out of provided sourcecode failed. Please make sure that the provided source code can be compiled.',
        },
        expect.anything(),
      );
    });

    it('reports fail if checking the compiler version fails', async () => {
      const task: VerificationTaskDto = {
        submissionId: '11111111-1111-1111-1111-111111111111',
        contractId: 'ct_123456789',
        sourceFiles: [
          {
            filePath: 'file.aes',
            content: 'mock',
          },
        ],
        bytecode: 'mock',
        compiler: '7.0.0',
        entryFile: 'mock',
        encodedInitCallParameters: 'mock',
      };

      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      when(mockedFs.readFile)
        .calledWith(expect.stringContaining('_result.json'))
        .mockResolvedValue('mock');
      when(execCallback)
        .calledWith(expect.stringContaining('--compiled_by'), expect.anything())
        .mockImplementation((_cmd, cb) =>
          cb(new Error('Error during checking compiler version')),
        );

      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ workerId: 123, workerPrivKey: SAMPLE_RSA_KEY });
      when(configService.get)
        .calledWith('gateway-api')
        .mockReturnValue({ url: 'https://gateway-url' });

      await service.processVerificationTask(task);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://gateway-url/verification/notify/ct_123456789',
        {
          source: 123,
          submissionId: '11111111-1111-1111-1111-111111111111',
          status: 'fail',
          result:
            'Unable to verify compiler version. Bytecode of this contract seems not to be supported.',
        },
        expect.anything(),
      );
    });

    it('reports fail if the compiler version does not match the expected one', async () => {
      const task: VerificationTaskDto = {
        submissionId: '11111111-1111-1111-1111-111111111111',
        contractId: 'ct_123456789',
        sourceFiles: [
          {
            filePath: 'file.aes',
            content: 'mock',
          },
        ],
        bytecode: 'mock',
        compiler: '7.0.0',
        entryFile: 'mock',
        encodedInitCallParameters: 'mock',
      };

      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      when(mockedFs.readFile)
        .calledWith(expect.stringContaining('_result.json'))
        .mockResolvedValue('mock');
      when(execCallback)
        .calledWith(expect.stringContaining('--compiled_by'), expect.anything())
        .mockImplementation((_cmd, cb) => cb(undefined, { stdout: '7.4.0' }));

      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ workerId: 123, workerPrivKey: SAMPLE_RSA_KEY });
      when(configService.get)
        .calledWith('gateway-api')
        .mockReturnValue({ url: 'https://gateway-url' });

      await service.processVerificationTask(task);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://gateway-url/verification/notify/ct_123456789',
        {
          source: 123,
          submissionId: '11111111-1111-1111-1111-111111111111',
          status: 'fail',
          result:
            'The provided compiler version (7.0.0) does not match the one used to compile the contract.',
        },
        expect.anything(),
      );
    });

    it('reports fail if the bytecode validation was unsuccessful', async () => {
      const task: VerificationTaskDto = {
        submissionId: '11111111-1111-1111-1111-111111111111',
        contractId: 'ct_123456789',
        sourceFiles: [
          {
            filePath: 'file.aes',
            content: 'mock',
          },
        ],
        bytecode: 'mock',
        compiler: '7.0.0',
        entryFile: 'mock',
        encodedInitCallParameters: 'mock',
      };

      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      when(mockedFs.readFile)
        .calledWith(expect.stringContaining('_result.json'))
        .mockResolvedValue('mock');

      when(execCallback)
        .calledWith(expect.stringContaining('--compiled_by'), expect.anything())
        .mockImplementation((_cmd, cb) => cb(undefined, { stdout: '7.0.0' }))
        .calledWith(expect.stringContaining('--validate'), expect.anything())
        .mockImplementation((_cmd, cb) =>
          cb(new Error('Error during validation')),
        );

      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ workerId: 123, workerPrivKey: SAMPLE_RSA_KEY });
      when(configService.get)
        .calledWith('gateway-api')
        .mockReturnValue({ url: 'https://gateway-url' });

      await service.processVerificationTask(task);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://gateway-url/verification/notify/ct_123456789',
        {
          source: 123,
          submissionId: '11111111-1111-1111-1111-111111111111',
          status: 'fail',
          result: 'The bytecode validation was not successful.',
        },
        expect.anything(),
      );
    });

    it('reports fail if decoding init call parameters was unsuccessful', async () => {
      const task: VerificationTaskDto = {
        submissionId: '11111111-1111-1111-1111-111111111111',
        contractId: 'ct_123456789',
        sourceFiles: [
          {
            filePath: 'file.aes',
            content: 'mock',
          },
        ],
        bytecode: 'mock',
        compiler: '7.0.0',
        entryFile: 'mock',
        encodedInitCallParameters: 'mock',
      };

      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      when(mockedFs.readFile)
        .calledWith(expect.stringContaining('_result.json'))
        .mockResolvedValue('mock');

      when(execCallback)
        .calledWith(expect.stringContaining('--compiled_by'), expect.anything())
        .mockImplementation((_cmd, cb) => cb(undefined, { stdout: '7.0.0' }))
        .calledWith(expect.stringContaining('--validate'), expect.anything())
        .mockImplementation((_cmd, cb) => cb(undefined, { stdout: 'mock' }))
        .calledWith(
          expect.stringContaining('--decode_calldata'),
          expect.anything(),
        )
        .mockImplementation((_cmd, cb) =>
          cb(new Error('Error during decoding init call params')),
        );

      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ workerId: 123, workerPrivKey: SAMPLE_RSA_KEY });
      when(configService.get)
        .calledWith('gateway-api')
        .mockReturnValue({ url: 'https://gateway-url' });

      await service.processVerificationTask(task);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://gateway-url/verification/notify/ct_123456789',
        {
          source: 123,
          submissionId: '11111111-1111-1111-1111-111111111111',
          status: 'fail',
          result: 'Decoding init method parameters was not successful.',
        },
        expect.anything(),
      );
    });

    it('reports success if the verification task was completed successfully', async () => {
      const task: VerificationTaskDto = {
        submissionId: '11111111-1111-1111-1111-111111111111',
        contractId: 'ct_123456789',
        sourceFiles: [
          {
            filePath: 'file.aes',
            content: 'mock',
          },
        ],
        bytecode: 'mock',
        compiler: '7.0.0',
        entryFile: 'mock',
        encodedInitCallParameters: 'mock',
      };

      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      when(mockedFs.readFile)
        .calledWith(expect.stringContaining('_result.json'))
        .mockResolvedValue('mock');

      when(execCallback)
        .calledWith(expect.stringContaining('--compiled_by'), expect.anything())
        .mockImplementation((_cmd, cb) => cb(undefined, { stdout: '7.0.0' }))
        .calledWith(expect.stringContaining('--validate'), expect.anything())
        .mockImplementation((_cmd, cb) => cb(undefined, { stdout: 'mock' }))
        .calledWith(
          expect.stringContaining('--decode_calldata'),
          expect.anything(),
        )
        .mockImplementation((_cmd, cb) => cb(undefined, { stdout: 'mock' }));

      when(configService.get)
        .calledWith('app')
        .mockReturnValue({ workerId: 123, workerPrivKey: SAMPLE_RSA_KEY });
      when(configService.get)
        .calledWith('gateway-api')
        .mockReturnValue({ url: 'https://gateway-url' });

      await service.processVerificationTask(task);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://gateway-url/verification/notify/ct_123456789',
        {
          initCallParameters: 'mock',
          result: 'mock',
          source: 123,
          submissionId: '11111111-1111-1111-1111-111111111111',
          status: 'success',
        },
        expect.anything(),
      );
    });
  });

  it('ackVerificiationTaskProcessing sends a notification about processing to API Gateway', async () => {
    const task: VerificationTaskDto = {
      submissionId: '11111111-1111-1111-1111-111111111111',
      contractId: 'ct_123456789',
      sourceFiles: [],
      bytecode: 'mock',
      compiler: 'mock',
      entryFile: 'mock',
      encodedInitCallParameters: 'mock',
    };
    when(configService.get)
      .calledWith('app')
      .mockReturnValue({ workerId: 123, workerPrivKey: SAMPLE_RSA_KEY });
    when(configService.get)
      .calledWith('gateway-api')
      .mockReturnValue({ url: 'https://gateway-url' });

    await service.ackVerificiationTaskProcessing(task);

    expect(httpService.post).toHaveBeenCalledWith(
      'https://gateway-url/verification/notify/ct_123456789',
      {
        source: 123,
        submissionId: '11111111-1111-1111-1111-111111111111',
        status: 'processing',
      },
      {
        headers: {
          'x-api-signature':
            'RMiVLHNFgYUfwvdvLXXwX1eiSWgm5ZA1kQu46r+jOznN+u1ffvjDqsYfQpRjV8kvJ/gUbj4EHUnlikyM6tI6t1iR/9iaGCs/fObbGA0fmzSrU2mCPMQruIs/siCUamMQXT2DDswNe/hBisg5Ag30IsK593IWdLU6Qt6eRfgN4Rg=',
        },
      },
    );
  });
});
