import { Injectable } from '@nestjs/common';
import { VerificationTaskDto } from './dto/verification-task.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { VerificationNotificationDto } from './dto/verification-notification.dto';
import { VerificationStatus } from 'apps/scv-gateway/src/verification/verification.types';
import { exec as execCallback } from 'child_process';
import { writeFile, readFile } from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';
const exec = promisify(execCallback);

const CONCTRACT_DIRECTORY = `/usr/src/aesophia_cli/contract/`;

@Injectable()
export class VerificationService {
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

    // WRITE CONTRACT FILES FOR VERIFICATION
    try {
      await exec(`cd ${CONCTRACT_DIRECTORY} && rm -rf -- ..?* .[!.]* *`);

      await Promise.all(
        task.sourceFiles.map(async (file) => {
          const filePath = path.resolve(CONCTRACT_DIRECTORY, file.filePath);
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
        `cd ${CONCTRACT_DIRECTORY} && ../aesophia_cli --create_json_aci ${task.entryFile} -o _result.json`,
      );
      const aci = await readFile(
        path.resolve(CONCTRACT_DIRECTORY, '_result.json'),
      );
      processingNotification.result = aci.toString();
    } catch (error) {
      console.debug(`Generating ${task.submissionId} ACI failed`);
      processingNotification.result =
        'Generating ACI out of provided sourcecode failed.';
      await this.sendVerificationNotification(
        task.contractId,
        processingNotification,
      );
      return;
    }

    // VERIFY COMPILER VERSION
    try {
      const { stdout } = await exec(
        `cd ${CONCTRACT_DIRECTORY} && ../aesophia_cli --compiled_by ${task.bytecode}`,
      );
      const compilerVersion = stdout.trim();
      if (task.compiler !== compilerVersion) {
        processingNotification.result = `The provided compiler version (${task.compiler}) does not match the one used to compile the contract.`;
        console.debug(
          `The provided compiler version (${task.compiler}) does not match the one used to compile the contract (${compilerVersion}).`,
        );
        await this.sendVerificationNotification(
          task.contractId,
          processingNotification,
        );
        return;
      }
    } catch (error) {
      processingNotification.result =
        'Unable to verify compiler version. Bytecode of this contract seems not to be supported.';
      console.warn(
        'Unable to verify compiler version. Bytecode of this contract seems not to be supported.',
        task.submissionId,
      );
      await this.sendVerificationNotification(
        task.contractId,
        processingNotification,
      );
      return;
    }

    // VERIFY BYTECODE
    try {
      await exec(
        `cd ${CONCTRACT_DIRECTORY} && ../aesophia_cli --validate ${task.bytecode} ${task.entryFile}`,
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
        `cd ${CONCTRACT_DIRECTORY} && ../aesophia_cli --decode_calldata "${task.encodedInitCallParameters}" --calldata_fun "init" ${task.entryFile}`,
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
