import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ContractSubmission } from './contract-submission.entity';

@Entity('contract_submission_source_files')
export class ContractSubmissionSourceFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filePath: string;

  @Column()
  content: string;

  @ManyToOne(() => ContractSubmission, (submission) => submission.sourceFiles)
  submission: ContractSubmission;
}
