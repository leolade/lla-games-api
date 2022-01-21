import { Test, TestingModule } from '@nestjs/testing';
import { MotusGameController } from './motus-game-controller';

describe('GameController', () => {
  let controller: MotusGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotusGameController],
    }).compile();

    controller = module.get<MotusGameController>(MotusGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
