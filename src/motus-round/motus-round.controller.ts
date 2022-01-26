import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MotusPlayerGameDto } from 'lla-party-games-dto/dist/motus-player-game.dto';
import { MotusRoundPropositionValidationDto } from 'lla-party-games-dto/dist/motus-round-proposition-validation.dto';
import { MotusRoundPropositionDto } from 'lla-party-games-dto/dist/motus-round-proposition.dto';
import { MotusRoundDto } from 'lla-party-games-dto/dist/motus-round.dto';
import { RoundEndSummaryDto } from 'lla-party-games-dto/dist/round-end-summary.dto';
import { Observable } from 'rxjs';
import { MotusRoundFacadeService } from './motus-round.facade.service';

@Controller('motus/round')
export class MotusRoundController {
  constructor(private motusRoundFacadeService: MotusRoundFacadeService) {}

  @Post(':idRoundPlayed/proposition/unlogged')
  makePropositionUnlogged(
    @Body() proposition: MotusRoundPropositionDto,
    @Param() params,
  ): Observable<MotusRoundPropositionValidationDto> {
    return this.motusRoundFacadeService.makePropositionUnlogged(
      proposition,
      params.idRoundPlayed,
    );
  }

  @Get('/:roundId')
  getRoundWord(@Param() params): Observable<MotusRoundDto> {
    return this.motusRoundFacadeService.getRound(params.roundId);
  }

  @Get('points/unlogged/:roundId/:userId')
  getPointsRoundUnloggedUser(@Param() params): Observable<RoundEndSummaryDto> {
    return this.motusRoundFacadeService.getPointsRoundUnloggedUser(
      params.roundId,
      params.userId,
    );
  }

  @Get(`:userId/rounds`)
  getDailyGameForUser(@Param() params): Observable<MotusPlayerGameDto> {
    return this.motusRoundFacadeService.getDailyGameForUser(
      params.userId,
    );
  }
}
