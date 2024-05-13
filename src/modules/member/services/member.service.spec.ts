import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { UserService } from 'src/modules/user/services/user.service';

describe('MemberService', () => {
  let service: MemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberService, UserService],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
