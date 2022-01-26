import { Test, TestingModule } from '@nestjs/testing';
import { CalculPointsBusinessService } from './calcul-points-business.service';

describe('CalculPointsService', () => {
  let service: CalculPointsBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculPointsBusinessService],
    }).compile();

    service = module.get<CalculPointsBusinessService>(
      CalculPointsBusinessService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
