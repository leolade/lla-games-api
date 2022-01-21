import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';


export class MotusGameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  motDuJour: boolean;

  @CreateDateColumn()
  createdDate: Date;
}
