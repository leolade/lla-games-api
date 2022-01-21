import { Module } from '@nestjs/common';
import { MotController } from './mot.controller';
import { MotFacadeService } from './mot.facade.service';

@Module({
  controllers: [MotController],
  providers: [MotFacadeService]
})
export class MotModule {}
