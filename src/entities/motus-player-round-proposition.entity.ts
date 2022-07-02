import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MotusPlayerRoundEntity } from './motus-player-round.entity';

@Entity()
export class MotusPlayerRoundPropositionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  suggestWord: string;

  @Column()
  encodedValidation: string;

  @ManyToOne(
    () => MotusPlayerRoundEntity,
    (round: MotusPlayerRoundEntity) => round.propositions,
    { onDelete: 'CASCADE' },
  )
  round: MotusPlayerRoundEntity;

  @CreateDateColumn()
  createdDate: Date;
}
