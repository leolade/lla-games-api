import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MotusPlayerRoundPropositionEntity } from './motus-player-round-proposition.entity';
import { MotusRoundEntity } from './motus-round.entity';
import { UserEntity } from './user.entity';

@Entity()
export class MotusPlayerRoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(
    () => MotusPlayerRoundPropositionEntity,
    (propostion: MotusPlayerRoundPropositionEntity) => propostion.round,
  )
  propositions: MotusPlayerRoundPropositionEntity[];

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.roundsPlayed)
  player: UserEntity;

  @ManyToOne(
    () => MotusRoundEntity,
    (round: MotusRoundEntity) => round.roundsPlayed,
  )
  round: MotusRoundEntity;
}
