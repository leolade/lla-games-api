import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MotusGameDto } from 'lla-party-games-dto/dist/motus-game.dto';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Raw, Repository } from 'typeorm';
import { MotusGameEntity } from '../entities/motus-game.entity';
import { MotusPlayerRoundEntity } from '../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { MotBusinessService } from '../mot/mot-business/mot-business.service';

@Injectable()
export class MotusGameBusinessService {
  constructor(
    @InjectRepository(MotusGameEntity)
    private gameRepository: Repository<MotusGameEntity>,
    @InjectRepository(MotusRoundEntity)
    private motusRoundRepository: Repository<MotusRoundEntity>,
    @InjectRepository(UnloggedUserEntity)
    private unloggedUserRepository: Repository<UnloggedUserEntity>,
    @InjectRepository(MotusPlayerRoundEntity)
    private motusPlayerRoundRepository: Repository<MotusPlayerRoundEntity>,
    private motBusinessService: MotBusinessService,
  ) {}

  createGame(
    dailyGame: boolean,
    nbCharMin: number | undefined,
    nbCharMax: number | undefined,
    nbRound: number | undefined,
  ): Observable<MotusGameEntity> {
    return from(
      // On sauvegarde notre instance de jeu
      this.gameRepository.save({
        dailyGame: dailyGame,
        nbCharMin: nbCharMin,
        nbCharMax: nbCharMax,
        nbRound: nbRound,
      }),
    ).pipe(
      switchMap((gameEntity: MotusGameEntity) => {
        // On génère les mots de notre instance de jeu
        return forkJoin([
          of(gameEntity),
          this.motBusinessService.getRandomWords(
            gameEntity.nbCharMin,
            gameEntity.nbCharMax,
            gameEntity.nbRound,
          ),
        ]) as Observable<[MotusGameEntity, string[]]>;
      }),
      switchMap(([gameEntity, randomsWords]: [MotusGameEntity, string[]]) => {
        // On crée nos instance de rounds de jeu
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
          return {
            ...gameEntity,
            rounds: roundsEntities,
          };
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

  getOrCreateDailyGame(): Observable<MotusGameEntity> {
    return from(
      this.gameRepository.findOne({
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
        if (!game) {
          return this.createGame(true, undefined, undefined, 1);
        }
        return of(game);
      }),
    );
  }

  startGame(gameId: string): Observable<MotusGameDto> {
    return from(
      this.gameRepository.findOne({
        where: {
          id: gameId,
        },
        relations: ['usersRegistered', 'rounds'],
      }),
    ).pipe(
      switchMap((game: MotusGameEntity) => {
        const motusPlayerRoundEntityToCreate: MotusPlayerRoundEntity[] = [];
        game.rounds.forEach((round: MotusRoundEntity) => {
          game.usersRegistered.forEach((userRegister: UnloggedUserEntity) => {
            motusPlayerRoundEntityToCreate.push(
              this.motusPlayerRoundRepository.create({
                round: round,
                unloggedUser: userRegister,
                propositions: [],
              }),
            );
          });
        });
        return from(
          this.motusPlayerRoundRepository.save(motusPlayerRoundEntityToCreate),
        ).pipe(map(() => this.gameEntityToDto(game)));
      }),
    );
  }

  join(gameId: string, userId: string): Observable<MotusGameDto> {
    return forkJoin([
      from(
        this.gameRepository.findOne({
          where: {
            id: gameId,
          },
          relations: ['usersRegistered'],
        }),
      ),
      from(this.unloggedUserRepository.findOneBy({ id: userId })),
    ]).pipe(
      switchMap(([game, user]: [MotusGameEntity, UnloggedUserEntity]) => {
        game.usersRegistered.push(user);
        return from(this.gameRepository.save(game));
      }),
      map((game: MotusGameEntity) => {
        return this.gameEntityToDto(game);
      }),
    );
  }
}
