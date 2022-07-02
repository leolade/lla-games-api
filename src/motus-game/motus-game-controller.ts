import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MotusGameCreateParamsDto } from 'lla-party-games-dto/dist/motus-game-create-params.dto';
import { MotusGameDto } from 'lla-party-games-dto/dist/motus-game.dto';
import { UserDto } from 'lla-party-games-dto/dist/user.dto';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MotusGameFacadeService } from './motus-game-facade.service';

@Controller('motus/game')
export class MotusGameController {
  constructor(private motusGameFacadeService: MotusGameFacadeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  createGame(
    @Body() gameParams: MotusGameCreateParamsDto,
    @Request() request,
  ): Observable<MotusGameDto> {
    return this.motusGameFacadeService.createGame(
      gameParams,
      (request.user as UserDto).uuid,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('join/:gameId')
  joinGame(@Param() params, @Request() request): Observable<MotusGameDto> {
    return this.motusGameFacadeService.joinGame(
      params.gameId,
      (request.user as UserDto).uuid,
    );
  }

  @Post('start/:gameId')
  startGame(@Param() params): Observable<MotusGameDto> {
    return this.motusGameFacadeService.startGame(params.gameId);
  }

  @Get('daily-game')
  getDailyGame(): Observable<MotusGameDto> {
    return this.motusGameFacadeService.getDailyGame();
  }
}
