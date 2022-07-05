import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { ScoreRoundEntity } from '../../entities/score-round.entity';
import { UnloggedUserEntity } from '../../entities/unlogged-user.entity';

@Injectable()
export class ClassementRoundBusinessService {
  constructor(
    @InjectRepository(ScoreRoundEntity)
    private scoreRoundRepository: Repository<ScoreRoundEntity>,
  ) {}

  getClassement(
    roundId: string,
  ): Observable<[ScoreRoundEntity, UnloggedUserEntity, boolean][]> {
    return from(
      this.scoreRoundRepository.find({
        relations: [
          'playerRound',
          'playerRound.unloggedUser',
          'playerRound.round',
          'playerRound.propositions',
        ],
        where: [{ playerRound: { round: { id: roundId } } }],
        order: { points: 'DESC' },
      }),
    ).pipe(
      map((scores: ScoreRoundEntity[]) => {
        return scores
          .filter((score) => {
            return (
              score.playerRound.propositions.length === 6 ||
              ClassementRoundBusinessService.isScoreSuccess(score)
            );
          })
          .map((score: ScoreRoundEntity) => {
            return [
              score,
              score.playerRound.unloggedUser,
              ClassementRoundBusinessService.isScoreSuccess(score),
            ];
          });
      }),
    );
  }

  private static isScoreSuccess(score: ScoreRoundEntity): boolean {
    return score.playerRound.propositions.some((proposition) =>
      proposition.encodedValidation.split('').every((letter) => letter === '+'),
    );
  }
}
