import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MotusPlayerRoundPropositionEntity } from './motus-player-round-proposition.entity';
import { MotusRoundEntity } from './motus-round.entity';
import { UnloggedUserEntity } from './unlogged-user.entity';
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

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.roundsPlayed, { nullable: true })
  player: UserEntity;

  @ManyToOne(() => UnloggedUserEntity, (user: UnloggedUserEntity) => user.roundsPlayed, { nullable: false })
  unloggedUser: UnloggedUserEntity;

  @ManyToOne(
    () => MotusRoundEntity,
    (round: MotusRoundEntity) => round.roundsPlayed,
  )
  round: MotusRoundEntity;
}
