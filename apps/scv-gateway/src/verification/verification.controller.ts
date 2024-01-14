import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { VerificationSupervisorService } from './verification-supervisor.service';
import { VerificationNotificationDto } from './dto/verification-notification.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { WorkerAuthGuard } from './guards/worker-auth.guard';

@Controller()
@ApiExcludeController()
@UseGuards(WorkerAuthGuard)
export class VerificationController {
  constructor(
    private readonly verificationSupervisorService: VerificationSupervisorService,
  ) {}

  @Post('/verification/notify/:contractId')
  async notify(
    @Param('contractId') contractId: string,
    @Body() notification: VerificationNotificationDto,
  ): Promise<void> {
    console.debug(
      'Received verification notification',
      contractId,
      notification,
    );
    await this.verificationSupervisorService.processNotification(
      contractId,
      notification,
    );
  }
}
