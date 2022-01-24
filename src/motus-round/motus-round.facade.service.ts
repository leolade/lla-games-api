import { Injectable } from '@nestjs/common';
import { MotusRoundPropositionValidationDto } from 'lla-party-games-dto/dist/motus-round-proposition-validation.dto';
import { MotusRoundPropositionDto } from 'lla-party-games-dto/dist/motus-round-proposition.dto';
import { MotusRoundDto } from 'lla-party-games-dto/dist/motus-round.dto';
import { forkJoin, from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MotusPlayerRoundPropositionEntity } from '../entities/motus-player-round-proposition.entity';
import { MotusPlayerRoundEntity } from '../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { UserBusinessService } from '../users/user-business.service';
import { MotusRoundBusinessService } from './buisness/motus-round-business.service';
import { MotusRoundPlayerBusinessService } from './buisness/motus-round-player-business.service';
import { MotusRoundPropositionBusinessService } from './buisness/motus-round-proposition-business.service';

@Injectable()
export class MotusRoundFacadeService {
  constructor(
    private userBusinessService: UserBusinessService,
    private motusRoundBusinessService: MotusRoundBusinessService,
    private motusRoundPlayerBusinessService: MotusRoundPlayerBusinessService,
    private motusRoundPropositionBusinessService: MotusRoundPropositionBusinessService,
  ) {
  }

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
}
