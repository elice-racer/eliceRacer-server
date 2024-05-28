import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { UserRepository } from 'src/modules/user/repositories';
import { TrackRepository } from 'src/modules/track/repositories';

describe('MemberService', () => {
  let service: MemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberService, UserRepository, TrackRepository],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
