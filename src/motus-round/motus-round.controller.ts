import { Body, Controller, Get, Param, Post, } from '@nestjs/common';
import { MotusRoundPropositionValidationDto } from 'lla-party-games-dto/dist/motus-round-proposition-validation.dto';
import { MotusRoundPropositionDto } from 'lla-party-games-dto/dist/motus-round-proposition.dto';
import { MotusRoundDto } from 'lla-party-games-dto/dist/motus-round.dto';
import { Observable } from 'rxjs';
import { MotusRoundFacadeService } from './motus-round.facade.service';

@Controller('motus/round')
export class MotusRoundController {
  constructor(private motusRoundFacadeService: MotusRoundFacadeService) {
  }

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
}
