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
  ): Observable<[ScoreRoundEntity, UnloggedUserEntity][]> {
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
        return scores.map((score: ScoreRoundEntity) => {
          return [score, score.playerRound.unloggedUser];
        });
      }),
    );
  }
}
