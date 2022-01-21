import {
  Body,
  Controller, Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MotusRoundPropositionValidationDto } from 'lla-party-games-dto/dist/motus-round-proposition-validation.dto';
import { MotusRoundPropositionDto } from 'lla-party-games-dto/dist/motus-round-proposition.dto';
import { UserDto } from 'lla-party-games-dto/dist/user.dto';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MotusRoundFacadeService } from './motus-round.facade.service';

@Controller('motus/round')
export class MotusRoundController {
  constructor(private motusRoundFacadeService: MotusRoundFacadeService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':idRoundPlayed/proposition')
  makeProposition(
    @Body() proposition: MotusRoundPropositionDto,
    @Param() params,
    @Request() request: Request,
  ): Observable<MotusRoundPropositionValidationDto> {
    return this.motusRoundFacadeService.makeProposition(
      proposition,
      params.id,
      request['user'] as UserDto,
    );
  }

  @Post('daily-game/proposition')
  makeDailyGameProposition(
    @Body() proposition: MotusRoundPropositionDto,
    @Param() params,
  ): Observable<MotusRoundPropositionValidationDto> {
    return this.motusRoundFacadeService.makeDailyGameProposition(
      proposition,
      params.id,
    );
  }

  @Get(':roundId/word')
  getRoundWord(@Param() params): Observable<string> {
    return this.motusRoundFacadeService.getRoundWord(params.id);
  }
}
