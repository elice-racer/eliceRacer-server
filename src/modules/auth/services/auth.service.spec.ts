import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';
import { Users } from 'src/modules/user/entities';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, SmsService, UserService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handlePhoneVerification', () => {});

  describe('', () => {
    it('', async () => {});
  });

  describe('authencticatePhoneNumber', () => {
    it('번호가 존재하고 회원가입이 되어있으면 ConflictException 반환한다', async () => {
      const user = new Users();
      user.isVerified = true;

      userService.findUserByPhoneNumber.mockResolvedValue(user);

      await expect(
        service.authencticatePhoneNumber('01012345678'),
      ).rejects.toThrow(ConflictException);
    });

    it('번호가 존재하지 않으면 true를 반환한다', async () => {
      userService.findUserByPhoneNumber.mockResolvedValue(undefined);
      const result = await service.authencticatePhoneNumber('01012345678');

      expect(result).toBe(true);
    });

    it('번호가 존재하고 회원가입이 되어있지 않으면 true를 반환한다', async () => {
      const user = new Users();
      user.isVerified = false;

      userService.findUserByPhoneNumber.mockResolvedValue(user);

      const result = await service.authencticatePhoneNumber('01012345678');

      expect(result).toBe(true);
    });
  });
});
