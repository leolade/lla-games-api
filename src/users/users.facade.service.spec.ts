import { Test, TestingModule } from '@nestjs/testing';
import { UsersFacadeService } from './users.facade.service';

describe('Users.FacadeService', () => {
  let service: UsersFacadeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersFacadeService],
    }).compile();

    service = module.get<UsersFacadeService>(UsersFacadeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
