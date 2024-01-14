import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { VerificationStatus } from '../verification.types';

@Entity('contract_verification_history')
export class ContractVerificationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 63 })
  submissionId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  workerId: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
  })
  prevStatus: VerificationStatus;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
  })
  newStatus: VerificationStatus;

  @Column({ nullable: true })
  result: string;

  @Column({ nullable: true })
  source: string;
}
