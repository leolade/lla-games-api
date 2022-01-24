import { Test, TestingModule } from '@nestjs/testing';
import { MotBusinessService } from './mot-business.service';

describe('MotBusinessService', () => {
  let service: MotBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotBusinessService],
    }).compile();

    service = module.get<MotBusinessService>(MotBusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
