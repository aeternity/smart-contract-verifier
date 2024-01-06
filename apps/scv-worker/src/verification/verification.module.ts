import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { ConfigModule } from '@nestjs/config';
import { VerificationAgentController } from './verification-agent.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [VerificationAgentController],
  providers: [VerificationService],
})
export class VerificationModule {}
