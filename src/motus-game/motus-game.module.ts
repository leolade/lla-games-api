import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotusGameEntity } from '../entities/motus-game.entity';
import { MotusPlayerRoundEntity } from '../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { MotBusinessService } from '../mot/mot-business/mot-business.service';
import { MotusGameBusinessService } from './motus-game-business.service';
import { MotusGameController } from './motus-game-controller';
import { MotusGameFacadeService } from './motus-game-facade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MotusGameEntity,
      MotusRoundEntity,
      UnloggedUserEntity,
      MotusPlayerRoundEntity,
    ]),
  ],
  controllers: [MotusGameController],
  providers: [
    MotusGameFacadeService,
    MotusGameBusinessService,
    MotBusinessService,
  ],
})
export class MotusGameModule {}
