import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { VerificationService } from './verification.service';
import { VerificationTaskDto } from './dto/verification-task.dto';

@Controller()
export class VerificationAgentController {
  constructor(private readonly verificationService: VerificationService) {}

  @MessagePattern('verification-task')
  async onNewVerificationTask(
    @Payload() data: unknown,
    @Ctx() context: RmqContext,
  ) {
    console.debug(
      `Verification task on queue "${context.getPattern()}" received.`,
    );
    // send processing message to the api

    const verificationTask = data as VerificationTaskDto;
    try {
      await this.verificationService.ackVerificiationTaskProcessing(
        verificationTask,
      );
    } catch (error) {
      console.error(
        'Error during confirming verification task processing',
        error,
      );
      return;
    }

    // process
    try {
      await this.verificationService.processVerificationTask(verificationTask);
    } catch (error) {
      console.error(
        'UNEXPECTED ERROR during processing verification task',
        error,
      );
    }

    // ack the message to get a new one
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
