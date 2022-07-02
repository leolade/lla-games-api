import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MotusPlayerRoundEntity } from './motus-player-round.entity';

@Entity()
export class ScoreRoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  points: number;

  @OneToOne(
    () => MotusPlayerRoundEntity,
    (round: MotusPlayerRoundEntity) => round.score,
    { onDelete: 'CASCADE' },
  )
  playerRound: MotusPlayerRoundEntity;
}
