import { Injectable } from '@nestjs/common';
import { MotusPlayerGameDto } from 'lla-party-games-dto/dist/motus-player-game.dto';
import { MotusPlayerPropositionValideDto } from 'lla-party-games-dto/dist/motus-player-proposition-valide.dto';
import { MotusRoundPropositionValidationDto } from 'lla-party-games-dto/dist/motus-round-proposition-validation.dto';
import { MotusRoundPropositionDto } from 'lla-party-games-dto/dist/motus-round-proposition.dto';
import { MotusRoundDto } from 'lla-party-games-dto/dist/motus-round.dto';
import { RoundEndSummaryPointsDto } from 'lla-party-games-dto/dist/round-end-summary-points.dto';
import { RoundEndSummaryDto } from 'lla-party-games-dto/dist/round-end-summary.dto';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MotusGameEntity } from '../entities/motus-game.entity';
import { MotusPlayerRoundPropositionEntity } from '../entities/motus-player-round-proposition.entity';
import { MotusPlayerRoundEntity } from '../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { MotusGameBusinessService } from '../motus-game/motus-game-business.service';
import { UserBusinessService } from '../users/user-business.service';
import { CalculPointsBusinessService } from './buisness/calcul-points-business.service';
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
  ) {}

  makePropositionUnlogged(
    proposition: MotusRoundPropositionDto,
    idRound: string,
  ): Observable<MotusRoundPropositionValidationDto> {
    return forkJoin([
      this.motusRoundBusinessService.getRoundById(idRound),
      this.userBusinessService.getUnloggedUser(proposition.localUserUuid),
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
      map((propositionEntity: MotusPlayerRoundPropositionEntity) => {
        return {
          suggestWord: propositionEntity.suggestWord,
          encodedValidation: propositionEntity.encodedValidation,
          propositionId: propositionEntity.id,
          localUserUuid: proposition.localUserUuid,
        } as MotusRoundPropositionValidationDto;
      }),
    );
  }

  getRound(id: string): Observable<MotusRoundDto> {
    return from(this.motusRoundBusinessService.getRoundById(id)).pipe(
      map((round: MotusRoundEntity) => {
        return {
          roundId: round.id,
          motADeviner: round.word,
        } as MotusRoundDto;
      }),
    );
  }

  getPointsRoundUnloggedUser(
    roundId: string,
    userId: string,
  ): Observable<RoundEndSummaryDto> {
    return forkJoin([
      this.motusRoundBusinessService.getRoundById(roundId),
      this.userBusinessService.getUnloggedUser(userId),
    ]).pipe(
      switchMap(([round, user]: [MotusRoundEntity, UnloggedUserEntity]) => {
        return forkJoin([
          of(round),
          of(user),
          this.motusRoundPlayerBusinessService.getOrCreateRoundPlayerUnlogged(
            round,
            user,
          ),
        ]);
      }),
      switchMap(
        ([round, user, roundPlayer]: [
          MotusRoundEntity,
          UnloggedUserEntity,
          MotusPlayerRoundEntity,
        ]) => {
          return forkJoin([
            of(round),
            this.motusRoundPropositionBusinessService.getPropositionsForRoundPlayer(
              roundPlayer,
            ),
          ]);
        },
      ),
      map(
        ([round, propositions]: [
          MotusRoundEntity,
          MotusPlayerRoundPropositionEntity[],
        ]) => {
          const pointsSummary: [number, [string, number][]] =
            this.calculPointsBusinessService.calculatePoints(
              round,
              propositions,
            );
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
    return forkJoin([
      this.userBusinessService.getUnloggedUser(userId),
      this.motusGameBusinessService.getOrCreateDailyGame(),
    ]).pipe(
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
}
