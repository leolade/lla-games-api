import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MotusRoundEntity } from './motus-round.entity';

@Entity()
export class MotusGameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  dailyGame: boolean;

  @Column({ default: 5 })
  nbCharMin: number;

  @Column({ default: 9 })
  nbCharMax: number;

  @Column({ default: 5 })
  nbRound: number;

  @OneToMany(() => MotusRoundEntity, (round: MotusRoundEntity) => round.game)
  rounds: MotusRoundEntity[];

  @CreateDateColumn()
  createdDate: Date;
}
