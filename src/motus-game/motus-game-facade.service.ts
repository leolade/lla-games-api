import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MotusGameCreateParamsDto } from 'lla-party-games-dto/dist/motus-game-create-params.dto';
import { MotusGameDto } from 'lla-party-games-dto/dist/motus-game.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Repository } from 'typeorm';
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
    return this.motusGameBusinessService
      .createGame(
        false,
        gameParams?.nbCharMin,
        gameParams?.nbCharMax,
        gameParams?.nbRound,
      )
      .pipe(
        map((game: MotusGameEntity) => {
          return this.motusGameBusinessService.gameEntityToDto(game);
        }),
      );
  }

  getDailyGame(): Observable<MotusGameDto> {
    return this.motusGameBusinessService.getOrCreateDailyGame().pipe(
      map((game: MotusGameEntity) => {
        return this.motusGameBusinessService.gameEntityToDto(game);
      }),
    );
  }
}
