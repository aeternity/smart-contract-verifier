import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ContractSubmissionSourceFile } from './contract-submission-source-file.entity';

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

  @Column({ length: 127 })
  entryFile: string;

  @OneToMany(() => ContractSubmissionSourceFile, (file) => file.submission, {
    cascade: true,
  })
  sourceFiles: ContractSubmissionSourceFile[];
}
