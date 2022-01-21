import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MotusGameCreateParamsDto } from 'lla-party-games-dto/dist/motus-game-create-params.dto';
import { MotusGameDto } from 'lla-party-games-dto/dist/motus-game.dto';
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
    @Request() request: Request,
  ): Observable<MotusGameDto> {
    return this.motusGameFacadeService.createGame(gameParams);
  }

  @Get('daily-game')
  getDailyGame(): Observable<MotusGameDto> {
    return this.motusGameFacadeService.getDailyGame();
  }
}
