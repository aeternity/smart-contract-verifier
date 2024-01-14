import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ContractSourceFile } from './contract-source-file.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 63, unique: true })
  contractId: string;

  @Column({ length: 127 })
  license: string;

  @Column({ length: 63 })
  compiler: string;

  @Column()
  entryFile: string;

  @Column()
  aci: string;

  @Column()
  bytecode: string;

  @Column()
  encodedInitCallParameters: string;

  @Column()
  initCallParameters: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  verifiedAt: Date;

  @OneToMany(() => ContractSourceFile, (file) => file.contract, {
    cascade: true,
  })
  sourceFiles: ContractSourceFile[];
}
