import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';


export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  motDuJour: boolean;

  @CreateDateColumn()
  createdDate: Date;
}
