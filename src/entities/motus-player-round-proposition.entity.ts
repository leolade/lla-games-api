import { ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MotusRoundEntity } from './motus-round.entity';
import { UserEntity } from './user.entity';

export class MotusPlayerRoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.roundsPlayed)
  player: UserEntity;

  @ManyToOne(
    (type) => MotusRoundEntity,
    (round: MotusRoundEntity) => round.roundsPlayed,
  )
  round: MotusRoundEntity;
}
