import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contracts')
export class Contract {
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
}
