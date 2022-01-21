import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MotusGameCreateParamsDto } from 'lla-party-games-dto/dist/motus-game-create-params.dto';
import { MotusGameDto } from 'lla-party-games-dto/dist/motus-game.dto';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Raw, Repository } from 'typeorm';
import { MotusGameEntity } from '../entities/motus-game.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { MotusGameBusinessService } from './motus-game-business.service';

@Injectable()
export class MotusGameFacadeService {
  constructor(
    @InjectRepository(MotusGameEntity)
    private motusGameRepository: Repository<MotusGameEntity>,
    @InjectRepository(MotusRoundEntity)
    private motusRoundRepository: Repository<MotusRoundEntity>,
    private motusGameBusinessService: MotusGameBusinessService,
  ) {}

  createGame(gameParams: MotusGameCreateParamsDto): Observable<MotusGameDto> {
    return this.motusGameBusinessService.createGame(
      false,
      gameParams?.nbCharMin,
      gameParams?.nbCharMax,
      gameParams?.nbRound,
    );
  }

  getDailyGame(): Observable<MotusGameDto> {
    return from(
      this.motusGameRepository.findOne({
        where: {
          dailyGame: true,
          createdDate: Raw((alias) => `${alias} > :date`, {
            date: new Date().toISOString().substring(0, 11),
          }),
        },
        relations: ['rounds'],
      }),
    ).pipe(
      switchMap((game: MotusGameEntity | undefined) => {
        return !!game
          ? of(this.motusGameBusinessService.gameEntityToDto(game))
          : this.motusGameBusinessService.createGame(
              true,
              undefined,
              undefined,
              1,
            );
      }),
    );
  }
}
