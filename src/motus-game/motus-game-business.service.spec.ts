import { Test, TestingModule } from '@nestjs/testing';
import { MotusGameBusinessService } from './motus-game-business.service';

describe('MotusBusinessService', () => {
  let service: MotusGameBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotusGameBusinessService],
    }).compile();

    service = module.get<MotusGameBusinessService>(MotusGameBusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
