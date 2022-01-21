import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MotusGameEntity } from './motus-game.entity';
import { MotusPlayerRoundEntity } from './motus-player-round.entity';

@Entity()
export class MotusRoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  wordIndex: number;

  @Column()
  word: string;

  @OneToMany(
    () => MotusPlayerRoundEntity,
    (roundPlayed: MotusPlayerRoundEntity) => roundPlayed.round,
  )
  roundsPlayed: MotusPlayerRoundEntity[];

  @ManyToOne(() => MotusGameEntity, (game: MotusGameEntity) => game.rounds)
  game: MotusGameEntity;
}
