import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Contract } from './contract.entity';

@Entity('contract_source_files')
export class ContractSourceFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filePath: string;

  @Column()
  content: string;

  @ManyToOne(() => Contract, (contract) => contract.id, {
    onDelete: 'CASCADE',
  })
  contract: Contract;
}
