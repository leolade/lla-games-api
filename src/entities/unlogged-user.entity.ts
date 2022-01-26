import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MotusPlayerRoundEntity } from './motus-player-round.entity';

@Entity()
export class UnloggedUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '', nullable: true })
  username: string;

  @OneToMany(
    () => MotusPlayerRoundEntity,
    (roundPlayed: MotusPlayerRoundEntity) => roundPlayed.unloggedUser,
  )
  roundsPlayed: MotusPlayerRoundEntity[];
}
