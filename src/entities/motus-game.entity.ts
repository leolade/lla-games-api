import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MotusRoundEntity } from './motus-round.entity';
import { UnloggedUserEntity } from './unlogged-user.entity';

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

  @ManyToMany(() => UnloggedUserEntity, { onDelete: 'CASCADE' })
  @JoinTable()
  usersRegistered: UnloggedUserEntity[];

  @CreateDateColumn()
  createdDate: Date;
}
