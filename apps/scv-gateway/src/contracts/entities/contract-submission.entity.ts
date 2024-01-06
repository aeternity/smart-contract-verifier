import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ContractSubmissionSourceFile } from './contract-submission-source-file.entity';
import { VerificationStatus } from '../../verification/verification.types';

@Entity('contract_submissions')
export class ContractSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 63 })
  contractId: string;

  @Column({ length: 127 })
  license: string;

  @Column({ length: 63 })
  compiler: string;

  @Column()
  entryFile: string;

  @Column()
  bytecode: string;

  @Column()
  encodedInitCallParameters: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdate: Date;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.NEW,
  })
  status: VerificationStatus;

  @Column({ nullable: true })
  result: string;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  retryAfter: Date;

  @OneToMany(() => ContractSubmissionSourceFile, (file) => file.submission, {
    cascade: true,
  })
  sourceFiles: ContractSubmissionSourceFile[];
}
