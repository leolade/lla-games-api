import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MotusGameEntity } from './motus-game.entity';


export class MotusRoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rangMot: number;

  @Column()
  mot: string;

  @ManyToOne(() => MotusGameEntity, (game: MotusGameEntity) => game.rounds)
  game: MotusGameEntity;
}
