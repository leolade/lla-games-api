import { Test, TestingModule } from '@nestjs/testing';
import { MotusRoundController } from './motus-round.controller';

describe('MotusRoundController', () => {
  let controller: MotusRoundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotusRoundController],
    }).compile();

    controller = module.get<MotusRoundController>(MotusRoundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
