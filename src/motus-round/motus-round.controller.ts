import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MotusPlayerGameDto } from 'lla-party-games-dto/dist/motus-player-game.dto';
import { MotusRoundPropositionValidationDto } from 'lla-party-games-dto/dist/motus-round-proposition-validation.dto';
import { MotusRoundPropositionDto } from 'lla-party-games-dto/dist/motus-round-proposition.dto';
import { MotusRoundRankDto } from 'lla-party-games-dto/dist/motus-round-rank.dto';
import { MotusRoundDto } from 'lla-party-games-dto/dist/motus-round.dto';
import { RoundEndSummaryDto } from 'lla-party-games-dto/dist/round-end-summary.dto';
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
    @Request() request,
  ): Observable<MotusRoundPropositionValidationDto> {
    return this.motusRoundFacadeService.makeProposition(
      proposition,
      (request.user as UserDto).uuid,
      params.idRoundPlayed,
    );
  }

  @Get('/:roundId')
  getRoundWord(@Param() params): Observable<MotusRoundDto> {
    return this.motusRoundFacadeService.getRound(params.roundId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('points/:roundId')
  getPoints(
    @Param() params,
    @Request() request,
  ): Observable<RoundEndSummaryDto> {
    return this.motusRoundFacadeService.getPoints(
      params.roundId,
      (request.user as UserDto).uuid,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(`game/daily`)
  getDailyGameForUser(@Request() request): Observable<MotusPlayerGameDto> {
    return this.motusRoundFacadeService.getDailyGameForUser(
      (request.user as UserDto).uuid,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':roundId/classement')
  getClassementRound(
    @Param() params,
    @Request() request,
  ): Observable<MotusRoundRankDto[]> {
    return this.motusRoundFacadeService.getClassement(
      params.roundId,
      (request.user as UserDto).uuid,
    );
  }
}
