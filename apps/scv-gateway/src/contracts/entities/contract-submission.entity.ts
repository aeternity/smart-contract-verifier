import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ContractSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 63 })
  contractId: string;
}
