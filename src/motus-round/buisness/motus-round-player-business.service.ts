import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { MotusPlayerRoundEntity } from '../../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../../entities/motus-round.entity';
import { UnloggedUserEntity } from '../../entities/unlogged-user.entity';

@Injectable()
export class MotusRoundPlayerBusinessService {
  constructor(
    @InjectRepository(MotusPlayerRoundEntity)
    private motusRoundPlayerRepository: Repository<MotusPlayerRoundEntity>,
  ) {}

  getOrCreateRoundPlayerUnlogged(
    round: MotusRoundEntity,
    userUnlogged: UnloggedUserEntity,
  ): Observable<MotusPlayerRoundEntity> {
    return from(
      this.motusRoundPlayerRepository.findOne({
        relations: ['round', 'unloggedUser'],
        where: [
          {
            round: {
              id: round.id,
            },
            unloggedUser: {
              id: userUnlogged.id,
            },
          },
        ],
      }),
    ).pipe(
      switchMap((playerRound?: MotusPlayerRoundEntity) => {
        if (playerRound) {
          return of(playerRound);
        }
        return this.motusRoundPlayerRepository.save({
          round: round,
          unloggedUser: userUnlogged,
          propositions: [],
        });
      }),
    );
  }
}
