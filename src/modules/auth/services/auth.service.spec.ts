import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';
import { User } from 'src/modules/user/entities';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { smsVerificationRepository } from '../repositories';
import { generateVerificationCode } from 'src/common/utils';

jest.unmock('./auth.service');

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

  describe('handleCodeVerification', () => {
    it('올바른 인증번호를 입력하면 해당 유저의 정보를 반환한다', async () => {
      const user = new User();
      const phoneNumber = '01012345678';
      const inputCode = '123456';

      smsVerificationRepo.getVerificationCode.mockResolvedValue(inputCode);
      userService.findUserByPhoneNumberWithTrack.mockResolvedValue(user);

      const result = await service.handleCodeVerification(
        phoneNumber,
        inputCode,
      );

      expect(result).toEqual(user);
    });
  });

  describe('verifyCode', () => {
    it('유효시간이 지난 인증번호를 입력하면 NotFoundException을 반환한다', async () => {
      smsVerificationRepo.getVerificationCode.mockResolvedValue(null);

      await expect(service.verifyCode('01012345678', '123456')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('유효하지 않은 인증번호를 입력하면 BadRequestException를 반환한다', async () => {
      const inputCode = '123450';
      const storedCode = '123456';

      smsVerificationRepo.getVerificationCode.mockResolvedValue(storedCode);

      await expect(
        service.verifyCode('01012345678', inputCode),
      ).rejects.toThrow(BadRequestException);
    });

    it('유효시간 내에 올바른 인증번호를 입력하면 OK를 반환한다 ', async () => {
      const phoneNumber = '01012345678';
      const inputCode = '123456';

      smsVerificationRepo.getVerificationCode.mockResolvedValue(inputCode);
      const result = await service.verifyCode(phoneNumber, inputCode);

      expect(result).toBe('OK');
    });
  });
  describe('handlePhoneVerification', () => {
    it('휴대폰 번호가 유효하면 인증번호를 생성, 저장하고 문자를 전송한다', async () => {
      const phoneNumber = '01012345678';
      const verificationCode = '123456';

      jest.spyOn(service, 'authencticatePhoneNumber').mockResolvedValue('OK');
      jest.spyOn(service, 'setVerificationCode').mockResolvedValue();
      (generateVerificationCode as jest.Mock).mockReturnValue(verificationCode);
      const result = await service.handlePhoneVerification(phoneNumber);

      expect(service.authencticatePhoneNumber).toHaveBeenCalledWith(
        phoneNumber,
      );
      expect(service.setVerificationCode).toHaveBeenCalledWith(
        phoneNumber,
        verificationCode,
      );
      expect(smsService.sendVerificationCode).toHaveBeenCalledWith(
        phoneNumber,
        verificationCode,
      );

      expect(result).toEqual('Success');
    });
  });

  describe('setSmsVerification', () => {
    it('핸드폰 번호와 인증 번호를 저장한다', async () => {
      const phoneNumber = '01012345678';
      const verificationCode = '123456';

      await service.setVerificationCode(phoneNumber, verificationCode);

      expect(smsVerificationRepo.setVerificationCode).toHaveBeenCalledWith(
        phoneNumber,
        verificationCode,
      );
    });
  });

  describe('authencticatePhoneNumber', () => {
    it('번호가 존재하고 회원가입이 되어있으면 ConflictException 반환한다', async () => {
      const user = new User();
      user.isSigned = true;

      userService.findUserByPhoneNumber.mockResolvedValue(user);

      await expect(
        service.authencticatePhoneNumber('01012345678'),
      ).rejects.toThrow(ConflictException);
    });

    it('번호로 회원가입이 되어있지 않으면 유저 정보를 반환한다', async () => {
      const user = new User();
      user.isSigned = false;

      userService.findUserByPhoneNumber.mockResolvedValue(user);

      const result = await service.authencticatePhoneNumber('01012345678');

      expect(result).toEqual('OK');
    });
  });
});
