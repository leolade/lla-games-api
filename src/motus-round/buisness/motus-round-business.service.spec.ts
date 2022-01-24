import { Test, TestingModule } from '@nestjs/testing';
import { MotusRoundBusinessService } from './motus-round-business.service';

describe('MotusRoundBusinessService', () => {
  let service: MotusRoundBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotusRoundBusinessService],
    }).compile();

    service = module.get<MotusRoundBusinessService>(MotusRoundBusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
