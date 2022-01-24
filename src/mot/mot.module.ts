import { Module } from '@nestjs/common';
import { MotController } from './mot.controller';
import { MotFacadeService } from './mot.facade.service';
import { MotBusinessService } from './mot-business/mot-business.service';

@Module({
  controllers: [MotController],
  providers: [MotFacadeService, MotBusinessService],
})
export class MotModule {}
