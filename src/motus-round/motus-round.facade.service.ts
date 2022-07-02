import { Injectable } from '@nestjs/common';
import { MotusPlayerGameDto } from 'lla-party-games-dto/dist/motus-player-game.dto';
import { MotusPlayerPropositionValideDto } from 'lla-party-games-dto/dist/motus-player-proposition-valide.dto';
import { MotusRoundPropositionValidationDto } from 'lla-party-games-dto/dist/motus-round-proposition-validation.dto';
import { MotusRoundPropositionDto } from 'lla-party-games-dto/dist/motus-round-proposition.dto';
import { MotusRoundRankDto } from 'lla-party-games-dto/dist/motus-round-rank.dto';
import { MotusRoundDto } from 'lla-party-games-dto/dist/motus-round.dto';
import { RoundEndSummaryPointsDto } from 'lla-party-games-dto/dist/round-end-summary-points.dto';
import { RoundEndSummaryDto } from 'lla-party-games-dto/dist/round-end-summary.dto';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MotusGameEntity } from '../entities/motus-game.entity';
import { MotusPlayerRoundPropositionEntity } from '../entities/motus-player-round-proposition.entity';
import { MotusPlayerRoundEntity } from '../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { ScoreRoundEntity } from '../entities/score-round.entity';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { MotusGameBusinessService } from '../motus-game/motus-game-business.service';
import { UserBusinessService } from '../users/user-business.service';
import { CalculPointsBusinessService } from './buisness/calcul-points-business.service';
import { ClassementRoundBusinessService } from './buisness/classement-round-business.service';
import { MotusRoundBusinessService } from './buisness/motus-round-business.service';
import { MotusRoundPlayerBusinessService } from './buisness/motus-round-player-business.service';
import { MotusRoundPropositionBusinessService } from './buisness/motus-round-proposition-business.service';

@Injectable()
export class MotusRoundFacadeService {
  constructor(
    private userBusinessService: UserBusinessService,
    private motusGameBusinessService: MotusGameBusinessService,
    private motusRoundBusinessService: MotusRoundBusinessService,
    private motusRoundPlayerBusinessService: MotusRoundPlayerBusinessService,
    private motusRoundPropositionBusinessService: MotusRoundPropositionBusinessService,
    private calculPointsBusinessService: CalculPointsBusinessService,
    private classementRoundBusinessService: ClassementRoundBusinessService,
  ) {}

  makeProposition(
    proposition: MotusRoundPropositionDto,
    userId: string,
    idRound: string,
  ): Observable<MotusRoundPropositionValidationDto> {
    return forkJoin([
      this.motusRoundBusinessService.getRoundById(idRound),
      this.userBusinessService.getUnloggedUser(userId),
    ]).pipe(
      switchMap(([round, user]: [MotusRoundEntity, UnloggedUserEntity]) => {
        return this.motusRoundPlayerBusinessService.getOrCreateRoundPlayerUnlogged(
          round,
          user,
        );
      }),
      switchMap((playerRound: MotusPlayerRoundEntity) => {
        return this.motusRoundPropositionBusinessService.savePropositionDto(
          proposition,
          playerRound,
        );
      }),
      switchMap((propositionEntity: MotusPlayerRoundPropositionEntity) => {
        return this.doRoundEndActions(propositionEntity.round.id).pipe(
          map(() => propositionEntity),
        );
      }),
      map((propositionEntity: MotusPlayerRoundPropositionEntity) => {
        return {
          suggestWord: propositionEntity.suggestWord,
          encodedValidation: propositionEntity.encodedValidation,
          propositionId: propositionEntity.id,
          localUserUuid: userId,
        } as MotusRoundPropositionValidationDto;
      }),
    );
  }

  getRound(id: string): Observable<MotusRoundDto> {
    return from(this.motusRoundBusinessService.getRoundById(id)).pipe(
      map((round: MotusRoundEntity) => {
        return {
          roundId: round.id,
          motADevinerLength: round.word.length,
        } as MotusRoundDto;
      }),
    );
  }

  getPoints(roundId: string, userId: string): Observable<RoundEndSummaryDto> {
    return forkJoin([
      this.motusRoundBusinessService.getRoundById(roundId),
      this.userBusinessService.getUnloggedUser(userId),
    ]).pipe(
      switchMap(([round, user]: [MotusRoundEntity, UnloggedUserEntity]) => {
        return forkJoin([
          of(round),
          this.motusRoundPlayerBusinessService.getOrCreateRoundPlayerUnlogged(
            round,
            user,
          ),
        ]);
      }),
      switchMap(
        ([round, roundPlayer]: [MotusRoundEntity, MotusPlayerRoundEntity]) => {
          return forkJoin([
            of(round),
            this.motusRoundPropositionBusinessService.getPropositionsForRoundPlayer(
              roundPlayer,
            ),
            of(roundPlayer),
          ]);
        },
      ),
      switchMap(
        ([round, propositions, roundPlayer]: [
          MotusRoundEntity,
          MotusPlayerRoundPropositionEntity[],
          MotusPlayerRoundEntity,
        ]) => {
          return forkJoin([
            of(round),
            this.getScores(roundPlayer, round, propositions).pipe(
              map(
                (scoreInfo: [ScoreRoundEntity, [number, [string, number][]]]) =>
                  scoreInfo[1],
              ),
            ),
          ]);
        },
      ),
      map(
        ([round, pointsSummary]: [
          MotusRoundEntity,
          [number, [string, number][]],
        ]) => {
          return {
            points: Array.from(pointsSummary[1]).map(
              ([description, points]: [string, number]) => {
                return {
                  points: points,
                  description: description,
                } as RoundEndSummaryPointsDto;
              },
            ),
            totalPoints: pointsSummary[0],
            word: round.word,
          } as RoundEndSummaryDto;
        },
      ),
    );
  }

  getDailyGameForUser(userId: string): Observable<MotusPlayerGameDto> {
    return this.userBusinessService.getUnloggedUser(userId).pipe(
      switchMap((user: UnloggedUserEntity) => {
        return forkJoin([
          of(user),
          this.motusGameBusinessService.getOrCreateDailyGame(),
        ]);
      }),
      switchMap(([user, game]: [UnloggedUserEntity, MotusGameEntity]) => {
        return this.motusRoundPlayerBusinessService.getOrCreateRoundPlayerUnlogged(
          game.rounds[0],
          user,
        );
      }),
      map((playerRound: MotusPlayerRoundEntity) => {
        const propositionSorted: MotusPlayerRoundPropositionEntity[] =
          playerRound.propositions.sort(
            (
              p1: MotusPlayerRoundPropositionEntity,
              p2: MotusPlayerRoundPropositionEntity,
            ) => {
              return p1.createdDate.getTime() === p2.createdDate.getTime()
                ? 0
                : p1.createdDate.getTime() > p2.createdDate.getTime()
                ? 1
                : -1;
            },
          );
        return {
          readonly:
            propositionSorted.length > 0 &&
            (propositionSorted.length === 6 ||
              !Array.from(
                propositionSorted[propositionSorted.length - 1]
                  .encodedValidation,
              ).find((lettre: string) => lettre !== '+')),
          propositionsValides: propositionSorted.map(
            (proposition: MotusPlayerRoundPropositionEntity) => {
              return {
                proposition: proposition.suggestWord,
                validation: proposition.encodedValidation,
              } as MotusPlayerPropositionValideDto;
            },
          ),
        } as MotusPlayerGameDto;
      }),
    );
  }

  getClassement(
    roundId: string,
    playerUuid: string,
  ): Observable<MotusRoundRankDto[]> {
    return this.classementRoundBusinessService.getClassement(roundId).pipe(
      map((values: [ScoreRoundEntity, UnloggedUserEntity][]) => {
        return values.map(
          (
            [score, user]: [ScoreRoundEntity, UnloggedUserEntity],
            index: number,
          ) => {
            return {
              points: score.points,
              me: playerUuid === user.id,
              customPlayerName: !!user.username,
              playerName: user.username,
              nbProposition: score.playerRound.propositions.length,
              rank: index + 1,
            } as MotusRoundRankDto;
          },
        );
      }),
    );
  }

  private doRoundEndActions(
    playerRoundId: string,
  ): Observable<[ScoreRoundEntity, [number, [string, number][]]]> {
    return this.motusRoundPlayerBusinessService
      .isRoundEnded(playerRoundId)
      .pipe(
        switchMap((roundEndedInfo: [MotusPlayerRoundEntity, boolean]) => {
          if (roundEndedInfo[1]) {
            return this.savePointsFromPlayerRoundId(playerRoundId);
          }
          return of(undefined);
        }),
      );
  }

  private savePointsFromPlayerRoundId(
    playerRoundId: string,
  ): Observable<[ScoreRoundEntity, [number, [string, number][]]]> {
    return this.motusRoundPlayerBusinessService
      .getRoundPlayerUnloggedById(playerRoundId)
      .pipe(
        switchMap((playerRoundEntity: MotusPlayerRoundEntity) => {
          return this.savePoints(
            playerRoundEntity,
            playerRoundEntity.round,
            playerRoundEntity.propositions,
          );
        }),
      );
  }

  private savePoints(
    playerRoundEntity: MotusPlayerRoundEntity,
    round: MotusRoundEntity,
    propositions: MotusPlayerRoundPropositionEntity[],
  ): Observable<[ScoreRoundEntity, [number, [string, number][]]]> {
    return of([
      this.calculPointsBusinessService.calculatePoints(round, propositions),
      playerRoundEntity,
    ]).pipe(
      switchMap(
        ([pointsSummary, roundPlayer]: [
          [number, [string, number][]],
          MotusPlayerRoundEntity,
        ]) => {
          return forkJoin([
            this.calculPointsBusinessService.saveScore(
              roundPlayer,
              pointsSummary[0],
            ),
            of(pointsSummary),
          ]);
        },
      ),
    );
  }

  private getScores(
    roundPlayer: MotusPlayerRoundEntity,
    round: MotusRoundEntity,
    propositions: MotusPlayerRoundPropositionEntity[],
  ): Observable<[ScoreRoundEntity, [number, [string, number][]]]> {
    return of([
      this.calculPointsBusinessService.calculatePoints(round, propositions),
      roundPlayer,
    ]).pipe(
      switchMap(
        ([pointsSummary, roundPlayer]: [
          [number, [string, number][]],
          MotusPlayerRoundEntity,
        ]) => {
          return forkJoin([
            this.motusRoundPlayerBusinessService.getScore(roundPlayer.id),
            of(pointsSummary),
          ]);
        },
      ),
    );
  }
}
