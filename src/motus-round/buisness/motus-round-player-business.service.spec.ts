import { Test, TestingModule } from '@nestjs/testing';
import { MotusRoundPlayerBusinessService } from './motus-round-player-business.service';

describe('MotusRoundPlayerBusinessService', () => {
  let service: MotusRoundPlayerBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotusRoundPlayerBusinessService],
    }).compile();

    service = module.get<MotusRoundPlayerBusinessService>(
      MotusRoundPlayerBusinessService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
