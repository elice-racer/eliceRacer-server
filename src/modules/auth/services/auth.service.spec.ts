import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';
import { User } from 'src/modules/user/entities';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SmsVerificationRepository } from '../repositories';
import { generateVerificationCode } from 'src/common/utils';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

jest.unmock('./auth.service');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let smsVerificationRepo: jest.Mocked<SmsVerificationRepository>;
  let smsService: jest.Mocked<SmsService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        SmsService,
        UserService,
        JwtService,
        ConfigService,
        SmsVerificationRepository,
        RefreshTokenRepository,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    smsService = module.get(SmsService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    smsVerificationRepo = module.get(SmsVerificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('login', () => {
    it('유효한 이메일또는 아이디와 비밀번호로 로그인 시 액세스 토큰과 리프레시 토큰을 발급받는다', async () => {
      const email = 'valid@test.com';
      const password = 'validPassword';

      const user = new User();
      user.email = email;
      user.password = 'hashedPassword';
      user.isSigned = true;

      const expectedAccessToken = 'access-token';
      const expectedRefreshToken = 'refresh-token';

      userService.findUserByEmailOrUsername.mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      jest.spyOn(service, 'validateUser').mockResolvedValue(user);

      jest
        .spyOn(service, 'createAccessToken')
        .mockReturnValue(expectedAccessToken);
      jest
        .spyOn(service, 'createRefreshToken')
        .mockReturnValue(expectedRefreshToken);

      const result = await service.login(email, password);

      expect(result).toEqual({
        accessToken: expectedAccessToken,
        refreshToken: expectedRefreshToken,
      });
    });
  });

  describe('createToken', () => {
    it('access token을 생성한다.', () => {
      const payload = { userId: 'uuid', email: 'test@example.com' };
      const expectedToken = `access-token`;

      configService.get.mockReturnValue('15m');
      jwtService.sign.mockReturnValue(expectedToken);

      const result = service.createAccessToken(payload);
      expect(result).toEqual(expectedToken);
    });

    it('refresh token을 생성한다.', () => {
      const payload = { userId: 'uuid', email: 'test@example.com' };
      const expectedToken = `refresh-token`;

      configService.get.mockReturnValue('3d');
      jwtService.sign.mockReturnValue(expectedToken);

      const result = service.createRefreshToken(payload);
      expect(result).toEqual(expectedToken);
    });
  });

  describe('validateUser', () => {
    it('이메일 또는 아이디와 비밀번호가 올바른 경우 사용자를 반환한다', async () => {
      const email = 'valid@example.com';
      const password = 'validPassword';
      const hashedPassword = 'hashedPassword';

      const user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.isSigned = true;

      userService.findUserByEmailOrUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(argon2.verify).toHaveBeenCalledWith(hashedPassword, password);
      expect(result.isSigned).toBeTruthy();
      expect(result).toEqual(user);
    });

    it('비밀번호가 틀릴 경우 UnauthorizedException를 반환한다', async () => {
      const email = 'test@test.com';
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword';
      const user = new User();

      user.email = email;
      user.password = hashedPassword;
      user.isSigned = true;

      userService.findUserByEmailOrUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
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
    it('회원가입이 되어있으면 ConflictException 반환한다', async () => {
      const user = new User();

      userService.findUserByPhoneNumberIncludingNonMembers.mockResolvedValue(
        user,
      );

      await expect(
        service.authencticatePhoneNumber('01012345678'),
      ).rejects.toThrow(ConflictException);
    });

    it('번호로 회원가입이 되어있지 않으면 유저 정보를 반환한다', async () => {
      userService.findUserByPhoneNumberIncludingNonMembers.mockResolvedValue(
        undefined,
      );

      const result = await service.authencticatePhoneNumber('01012345678');

      expect(result).toEqual('OK');
    });
  });
});
