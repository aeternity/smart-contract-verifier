import { Injectable } from '@nestjs/common';
import { VerificationTaskDto } from './dto/verification-task.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { VerificationNotificationDto } from './dto/verification-notification.dto';
import { VerificationStatus } from './verification.types';
import { exec as execCallback } from 'child_process';
import { writeFile, readFile, mkdir, access } from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';
import { ContractEncoder } from '@aeternity/aepp-calldata';

const exec = promisify(execCallback);

const CONTRACT_DIRECTORY = `/usr/src/contracts/`;
const COMPILERS_BASE = `/usr/src/compilers/`;

@Injectable()
export class VerificationService {
  private readonly contractEncoder = new ContractEncoder();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async processVerificationTask(task: VerificationTaskDto): Promise<void> {
    console.debug('Processing verification task', task.submissionId);

    // send verification result to the api
    const processingNotification: VerificationNotificationDto = {
      submissionId: task.submissionId,
      status: VerificationStatus.FAIL,
    };

    // DETECT COMPILER VERSION FROM BYTECODE
    let detectedCompiler: string;
    try {
      detectedCompiler = (
        this.contractEncoder.decode(task.bytecode as `cb_${string}`) as {
          compilerVersion: string;
        }
      ).compilerVersion;
    } catch (error) {
      processingNotification.result =
        'Unable to detect compiler version from bytecode. The bytecode may not be a valid Sophia contract.';
      console.warn(
        'Unable to detect compiler version from bytecode.',
        task.submissionId,
        error,
      );
      await this.sendVerificationNotification(
        task.contractId,
        processingNotification,
      );
      return;
    }

    const cliPath = `${COMPILERS_BASE}${detectedCompiler}/aesophia_cli`;

    // CHECK IF CLI BINARY EXISTS FOR DETECTED VERSION
    try {
      await access(cliPath);
    } catch {
      processingNotification.result = `Compiler version ${detectedCompiler} is not supported.`;
      console.warn(
        `Compiler version ${detectedCompiler} is not supported.`,
        task.submissionId,
      );
      await this.sendVerificationNotification(
        task.contractId,
        processingNotification,
      );
      return;
    }

    // WRITE CONTRACT FILES FOR VERIFICATION
    try {
      await exec(
        `rm -rf -- ${CONTRACT_DIRECTORY}* ${CONTRACT_DIRECTORY}.[!.]* ${CONTRACT_DIRECTORY}..?*`,
      );

      await Promise.all(
        task.sourceFiles.map(async (file) => {
          const filePath = path.resolve(CONTRACT_DIRECTORY, file.filePath);

          try {
            await mkdir(path.dirname(filePath), { recursive: true });
          } catch (err) {
            if (err.code !== 'EEXIST') {
              throw err;
            }
          }

          return writeFile(filePath, file.content);
        }),
      );
    } catch (error) {
      console.warn(
        `Verification of ${task.submissionId} failed during writing contract files for the following reason:`,
        error,
      );

      processingNotification.result =
        'Processing contract files was unsuccessful.';
      await this.sendVerificationNotification(
        task.contractId,
        processingNotification,
      );
      return;
    }

    // GENERATE ACI
    try {
      await exec(
        `cd ${CONTRACT_DIRECTORY} && ${cliPath} --create_json_aci ${task.entryFile} -o _result.json`,
      );
      const aci = await readFile(
        path.resolve(CONTRACT_DIRECTORY, '_result.json'),
      );
      processingNotification.result = aci.toString();
    } catch (error) {
      console.debug(`Generating ${task.submissionId} ACI failed`, error);
      processingNotification.result =
        'Generating ACI out of provided sourcecode failed. Please make sure that the provided source code can be compiled.';
      await this.sendVerificationNotification(
        task.contractId,
        processingNotification,
      );
      return;
    }

    // VERIFY BYTECODE
    try {
      await exec(
        `cd ${CONTRACT_DIRECTORY} && ${cliPath} --validate ${task.bytecode} ${task.entryFile}`,
      );
    } catch (error) {
      processingNotification.result =
        'The bytecode validation was not successful.';
      console.debug(
        'The bytecode validation was not successful.',
        task.submissionId,
      );
      await this.sendVerificationNotification(
        task.contractId,
        processingNotification,
      );
      return;
    }

    // DECODE INIT CALL PARAMETERS
    try {
      const { stdout } = await exec(
        `cd ${CONTRACT_DIRECTORY} && ${cliPath} --decode_calldata "${task.encodedInitCallParameters}" --calldata_fun "init" ${task.entryFile}`,
      );
      const initCallParameters = stdout.replace('Decoded calldata:', '').trim();
      processingNotification.initCallParameters = initCallParameters;
    } catch (error) {
      processingNotification.result =
        'Decoding init method parameters was not successful.';
      console.debug(
        'Decoding init function parameters was not successful.',
        task.submissionId,
        error,
      );
      await this.sendVerificationNotification(
        task.contractId,
        processingNotification,
      );
      return;
    }

    console.debug(
      'Verification task completed successfully!',
      task.submissionId,
    );

    processingNotification.status = VerificationStatus.SUCCESS;
    processingNotification.compiler = detectedCompiler;
    await this.sendVerificationNotification(
      task.contractId,
      processingNotification,
    );
  }

  async ackVerificiationTaskProcessing(
    task: VerificationTaskDto,
  ): Promise<void> {
    const processingNotification: VerificationNotificationDto = {
      submissionId: task.submissionId,
      status: VerificationStatus.PROCESSING,
    };

    await this.sendVerificationNotification(
      task.contractId,
      processingNotification,
    );
  }

  private async sendVerificationNotification(
    contractId: string,
    notification: VerificationNotificationDto,
  ): Promise<void> {
    const payload = {
      ...notification,
      source: this.configService.get('app').workerId,
    };

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(JSON.stringify(payload));
    const signature = signer.sign(
      this.configService.get('app').workerPrivKey,
      'base64',
    );

    await this.httpService
      .post(
        `${
          this.configService.get('gateway-api').url
        }/verification/notify/${contractId}`,
        payload,
        {
          headers: {
            'x-api-signature': signature,
          },
        },
      )
      .subscribe();
  }
}
