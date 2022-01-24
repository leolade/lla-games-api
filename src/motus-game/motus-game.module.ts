import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotusGameEntity } from '../entities/motus-game.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { MotBusinessService } from '../mot/mot-business/mot-business.service';
import { MotFacadeService } from '../mot/mot.facade.service';
import { MotusGameBusinessService } from './motus-game-business.service';
import { MotusGameController } from './motus-game-controller';
import { MotusGameFacadeService } from './motus-game-facade.service';

@Module({
  imports: [TypeOrmModule.forFeature([MotusGameEntity, MotusRoundEntity])],
  controllers: [MotusGameController],
  providers: [
    MotusGameFacadeService,
    MotusGameBusinessService,
    MotFacadeService,
    MotBusinessService,
  ],
})
export class MotusGameModule {}
