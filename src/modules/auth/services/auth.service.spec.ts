import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';
import { Users } from 'src/modules/user/entities';
import { ConflictException } from '@nestjs/common';
import { smsVerificationRepository } from '../repositories';
import { generateVerificationNumber } from 'src/common/utils';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let smsVerificationRepo: jest.Mocked<smsVerificationRepository>;
  let smsService: jest.Mocked<SmsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        SmsService,
        UserService,
        smsVerificationRepository,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    smsService = module.get(SmsService);
    smsVerificationRepo = module.get(smsVerificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handlePhoneVerification', () => {
    it('휴대폰 번호가 유효하면 인증번호를 생성, 저장하고 문자를 전송한다', async () => {
      const phoneNumber = '01012345678';
      const verificationNumber = '123456';
      const user = new Users();

      jest.spyOn(service, 'authencticatePhoneNumber').mockResolvedValue(user);
      jest.spyOn(service, 'setSmsVerification').mockResolvedValue();
      (generateVerificationNumber as jest.Mock).mockReturnValue(
        verificationNumber,
      );
      const result = await service.handlePhoneVerification(phoneNumber);

      expect(service.authencticatePhoneNumber).toHaveBeenCalledWith(
        phoneNumber,
      );
      expect(service.setSmsVerification).toHaveBeenCalledWith(
        phoneNumber,
        verificationNumber,
      );
      expect(smsService.sendVerificationCode).toHaveBeenCalledWith(
        phoneNumber,
        verificationNumber,
      );

      expect(result).toEqual(user);
    });
    it('이미 가입된 번호는 ConflictException에러를 반환한다 ', async () => {
      const phoneNumber = '01012345678';

      jest
        .spyOn(service, 'authencticatePhoneNumber')
        .mockRejectedValue(new ConflictException('이미 가입된 번호입니다'));

      await expect(
        service.handlePhoneVerification(phoneNumber),
      ).rejects.toThrow('이미 가입된 번호입니다');
    });
  });

  describe('setSmsVerification', () => {
    it('핸드폰 번호와 인증 번호를 저장한다', async () => {
      await service.setSmsVerification('01012345678', '123456');

      expect(smsVerificationRepo.setSmsVerification).toHaveBeenCalledWith(
        '01012345678',
        '123456',
      );
    });
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

    it('번호가 존재하지 않으면 빈 객체를 반환한다', async () => {
      userService.findUserByPhoneNumber.mockResolvedValue(undefined);
      const result = await service.authencticatePhoneNumber('01012345678');

      expect(result).toEqual({});
    });

    it('번호가 존재하고 회원가입이 되어있지 않으면 유저 정보를 반환한다', async () => {
      const user = new Users();
      user.isVerified = false;

      userService.findUserByPhoneNumber.mockResolvedValue(user);

      const result = await service.authencticatePhoneNumber('01012345678');

      expect(result).toEqual(user);
    });
  });
});
