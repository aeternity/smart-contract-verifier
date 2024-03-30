import { ApiProperty } from '@nestjs/swagger';

export class ContractSubmissionResponseDto {
  @ApiProperty({
    description:
      'UUID of the submission that may be used to query the status of the submission',
    example: 'd3b3b3b3-3b3b-3b3b-3b3b-3b3b3b3b3b3b',
  })
  submissionId: string;
}
