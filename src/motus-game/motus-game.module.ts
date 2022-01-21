import { Module } from '@nestjs/common';
import { MotusGameEntity } from '../entities/motus-game.entity';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { UserEntity } from '../entities/user.entity';
import { MotFacadeService } from '../mot/mot.facade.service';
import { MotusGameFacadeService } from './motus-game-facade.service';
import { MotusGameController } from './motus-game-controller';
import { MotusGameBusinessService } from './motus-game-business.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MotusGameEntity, MotusRoundEntity])],
  controllers: [MotusGameController],
  providers: [
    MotusGameFacadeService,
    MotusGameBusinessService,
    MotFacadeService,
  ],
})
export class MotusGameModule {}
