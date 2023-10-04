import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ContractSubmissionSourceFile } from './contract-submission-source-file.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAIL = 'fail',
}

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ nullable: true })
  result: string;

  @OneToMany(() => ContractSubmissionSourceFile, (file) => file.submission, {
    cascade: true,
  })
  sourceFiles: ContractSubmissionSourceFile[];
}
