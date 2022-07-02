import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MotusPlayerRoundPropositionEntity } from './motus-player-round-proposition.entity';
import { MotusRoundEntity } from './motus-round.entity';
import { ScoreRoundEntity } from './score-round.entity';
import { UnloggedUserEntity } from './unlogged-user.entity';

@Entity()
export class MotusPlayerRoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(
    () => MotusPlayerRoundPropositionEntity,
    (propostion: MotusPlayerRoundPropositionEntity) => propostion.round,
  )
  propositions: MotusPlayerRoundPropositionEntity[];

  @ManyToOne(
    () => UnloggedUserEntity,
    (user: UnloggedUserEntity) => user.roundsPlayed,
    { nullable: false, onDelete: 'CASCADE' },
  )
  unloggedUser: UnloggedUserEntity;

  @ManyToOne(
    () => MotusRoundEntity,
    (round: MotusRoundEntity) => round.roundsPlayed,
    { onDelete: 'CASCADE' },
  )
  round: MotusRoundEntity;

  @OneToOne(
    () => ScoreRoundEntity,
    (score: ScoreRoundEntity) => score.playerRound,
  ) // specify inverse side as a second parameter
  @JoinColumn()
  score: ScoreRoundEntity;
}
