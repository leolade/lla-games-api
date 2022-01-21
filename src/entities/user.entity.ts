import { Column, Entity, Generated, OneToMany, PrimaryColumn } from 'typeorm';
import { MotusPlayerRoundEntity } from './motus-player-round.entity';

@Entity()
export class UserEntity {
  @PrimaryColumn()
  username: string;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  displayName: string;

  @Column('boolean', { default: true })
  administrator = false;

  @OneToMany(
    () => MotusPlayerRoundEntity,
    (roundPlayed: MotusPlayerRoundEntity) => roundPlayed.player,
  )
  roundsPlayed: MotusPlayerRoundEntity[];
}
