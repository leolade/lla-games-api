import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotusPlayerRoundPropositionEntity } from '../entities/motus-player-round-proposition.entity';
import { MotusPlayerRoundEntity } from '../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { UserEntity } from '../entities/user.entity';
import { MotBusinessService } from '../mot/mot-business/mot-business.service';
import { UserBusinessService } from '../users/user-business.service';
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
      UserEntity,
      UnloggedUserEntity,
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
  ],
})
export class MotusRoundModule {}
