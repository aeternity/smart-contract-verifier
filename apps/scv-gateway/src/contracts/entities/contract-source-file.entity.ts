import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contract_source_files')
export class ContractSourceFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 63 })
  contractId: string;

  @Column({ length: 127 })
  fileName: string;

  @Column()
  content: string;
}
