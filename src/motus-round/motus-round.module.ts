import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotusGameEntity } from '../entities/motus-game.entity';
import { MotusPlayerRoundPropositionEntity } from '../entities/motus-player-round-proposition.entity';
import { MotusPlayerRoundEntity } from '../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { ScoreRoundEntity } from '../entities/score-round.entity';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { MotBusinessService } from '../mot/mot-business/mot-business.service';
import { MotusGameBusinessService } from '../motus-game/motus-game-business.service';
import { UserBusinessService } from '../users/user-business.service';
import { CalculPointsBusinessService } from './buisness/calcul-points-business.service';
import { ClassementRoundBusinessService } from './buisness/classement-round-business.service';
import { MotusRoundBusinessService } from './buisness/motus-round-business.service';
import { MotusRoundPlayerBusinessService } from './buisness/motus-round-player-business.service';
import { MotusRoundPropositionBusinessService } from './buisness/motus-round-proposition-business.service';
import { MotusRoundController } from './motus-round.controller';
import { MotusRoundFacadeService } from './motus-round.facade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MotusRoundEntity,
      MotusPlayerRoundEntity,
      MotusPlayerRoundPropositionEntity,
      UnloggedUserEntity,
      MotusGameEntity,
      ScoreRoundEntity,
    ]),
  ],
  controllers: [MotusRoundController],
  providers: [
    MotusRoundFacadeService,
    MotusRoundBusinessService,
    MotusRoundPlayerBusinessService,
    MotusRoundPropositionBusinessService,
    UserBusinessService,
    MotBusinessService,
    CalculPointsBusinessService,
    MotusGameBusinessService,
    ClassementRoundBusinessService,
  ],
})
export class MotusRoundModule {}
