import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MotusGameDto } from 'lla-party-games-dto/dist/motus-game.dto';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { MotusGameEntity } from '../entities/motus-game.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { MotFacadeService } from '../mot/mot.facade.service';

@Injectable()
export class MotusGameBusinessService {
  constructor(
    @InjectRepository(MotusGameEntity)
    private gameRepository: Repository<MotusGameEntity>,
    @InjectRepository(MotusRoundEntity)
    private motusRoundRepository: Repository<MotusRoundEntity>,
    private motFacadeService: MotFacadeService,
  ) {}

  createGame(
    dailyGame: boolean,
    nbCharMin: number | undefined,
    nbCharMax: number | undefined,
    nbRound: number | undefined,
  ): Observable<MotusGameDto> {
    return from(
      this.gameRepository.save({
        dailyGame: dailyGame,
        nbCharMin: nbCharMin,
        nbCharMax: nbCharMax,
        nbRound: nbRound,
      }),
    ).pipe(
      switchMap((gameEntity: MotusGameEntity) => {
        return forkJoin([
          of(gameEntity),
          this.motFacadeService.getRandomWords(
            gameEntity.nbCharMin,
            gameEntity.nbCharMax,
            gameEntity.nbRound,
          ),
        ]) as Observable<[MotusGameEntity, string[]]>;
      }),
      switchMap(([gameEntity, randomsWords]: [MotusGameEntity, string[]]) => {
        return forkJoin([
          of(gameEntity),
          from(
            this.motusRoundRepository.save(
              new Array(gameEntity.nbRound)
                .fill({})
                .map((item: MotusRoundEntity, index: number) => {
                  return {
                    game: gameEntity,
                    wordIndex: index,
                    word: randomsWords[index],
                  } as MotusRoundEntity;
                }),
            ),
          ),
        ]);
      }),
      map(
        ([gameEntity, roundsEntities]: [
          MotusGameEntity,
          MotusRoundEntity[],
        ]) => {
          return this.gameEntityToDto(gameEntity, roundsEntities);
        },
      ),
    );
  }

  gameEntityToDto(
    game: MotusGameEntity,
    rounds: MotusRoundEntity[] = game.rounds || [],
  ): MotusGameDto {
    return {
      nbRound: game.nbRound,
      nbCharMax: game.nbCharMax,
      nbCharMin: game.nbCharMin,
      dailyGame: game.dailyGame,
      gameId: game.id,
      roundsId: rounds.map((round: MotusRoundEntity) => round.id),
    } as MotusGameDto;
  }
}
