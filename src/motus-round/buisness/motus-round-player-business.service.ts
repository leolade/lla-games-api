import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { MotusPlayerRoundPropositionEntity } from '../../entities/motus-player-round-proposition.entity';
import { MotusPlayerRoundEntity } from '../../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../../entities/motus-round.entity';
import { ScoreRoundEntity } from '../../entities/score-round.entity';
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
        relations: ['round', 'unloggedUser', 'propositions'],
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

  getRoundPlayerUnloggedById(roundId): Observable<MotusPlayerRoundEntity> {
    return from(
      this.motusRoundPlayerRepository.findOneOrFail({
        relations: ['round', 'unloggedUser', 'propositions'],
        where: [
          {
            id: roundId,
          },
        ],
      }),
    );
  }

  isRoundEnded(
    playerRoundId: string,
  ): Observable<[MotusPlayerRoundEntity, boolean]> {
    return this.getRoundPlayerUnloggedById(playerRoundId).pipe(
      switchMap((playerRound: MotusPlayerRoundEntity) => {
        return of([
          playerRound,
          playerRound.propositions.length === 6 ||
            playerRound.propositions.find(
              (proposition: MotusPlayerRoundPropositionEntity) => {
                return proposition.encodedValidation
                  .split('')
                  .some((letter: string) => !['.', '-', '?'].includes(letter));
              },
            ),
        ] as [MotusPlayerRoundEntity, boolean]);
      }),
    );
  }

  getScore(id: string): Observable<ScoreRoundEntity> {
    return from(
      this.motusRoundPlayerRepository.findOneOrFail({
        where: {
          id: id,
        },
        relations: ['score'],
      }),
    ).pipe(
      map((playerRound: MotusPlayerRoundEntity) => {
        return playerRound.score;
      }),
    );
  }
}
