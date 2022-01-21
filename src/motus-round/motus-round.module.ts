import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotusRoundEntity } from '../entities/motus-round.entity';
import { MotusRoundController } from './motus-round.controller';
import { MotusRoundFacadeService } from './motus-round.facade.service';

@Module({
  imports: [TypeOrmModule.forFeature([MotusRoundEntity])],
  controllers: [MotusRoundController],
  providers: [MotusRoundFacadeService],
})
export class MotusRoundModule {}
