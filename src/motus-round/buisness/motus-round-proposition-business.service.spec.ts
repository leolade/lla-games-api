import { Test, TestingModule } from '@nestjs/testing';
import { MotusRoundPropositionBusinessService } from './motus-round-proposition-business.service';

describe('MotusRoundPropositionBusinessService', () => {
  let service: MotusRoundPropositionBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotusRoundPropositionBusinessService],
    }).compile();

    service = module.get<MotusRoundPropositionBusinessService>(
      MotusRoundPropositionBusinessService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
