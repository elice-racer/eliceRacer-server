import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';
import { RefreshTokenService } from './refresh-token.service';
import { User, UserStatus } from 'src/modules/user/entities';
import { VerificationService } from './verification.service';
import { AuthRepository } from '../repositories';
import { Track } from 'src/modules/track/entities';
import { VerifyCodeResDto } from '../dto';
import { BusinessException } from 'src/exception';
import { generateVerificationCode } from 'src/common/utils';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

jest.unmock('./auth.service');

describe('AuthService', () => {
  let service: AuthService;
  let smsService: jest.Mocked<SmsService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let verificationService: jest.Mocked<VerificationService>;
  let authRepo: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        SmsService,
        UserService,
        JwtService,
        ConfigService,
        VerificationService,
        RefreshTokenService,
        AuthRepository,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    smsService = module.get(SmsService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    verificationService = module.get(VerificationService);
    refreshTokenService = module.get(RefreshTokenService);
    authRepo = module.get(AuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logout', () => {
    it('사용자의 refreshToken을 삭제한다', async () => {
      const refresToken = 'valid-refresh-token';
      const jti = 'jwt-uuid';
      jwtService.verify.mockReturnValue({
        sub: 'userId-uuid',
        jti,
      });

      await service.logout(refresToken);
      expect(refreshTokenService.deleteRefreshToken).toHaveBeenCalledWith(jti);
    });
  });

  describe('refresh', () => {
    it('유효하지 않은 refresh token으로 재발급을 시도하면 BusinessException를 반환한다', async () => {
      const invalidRefreshToken = 'invalid-refresh-token';

      await expect(service.refresh(invalidRefreshToken)).rejects.toThrow(
        BusinessException,
      );
    });

    it('만료된 리프레시 토큰으로 재발급을 시도하면, 인증 실패로 BusinessException을 발생시킨다', async () => {
      const expiredRefreshToken = 'expired-refresh-token';
      jwtService.verify.mockReturnValue({ sub: 'userId', jti: 'jti' });
      refreshTokenService.getRefreshToken.mockResolvedValue(null);

      await expect(service.refresh(expiredRefreshToken)).rejects.toThrow(
        BusinessException,
      );
    });
    it('토큰에 해당하는 유저가 존재하지 않을 때, 인증 실패로 BusinessException을 발생시킨다', async () => {
      const validTokenNonexistentUser = 'valid-refresh-token';
      jwtService.verify.mockReturnValue({
        sub: 'nonexistentUserId',
        jti: 'jti',
      });
      refreshTokenService.getRefreshToken.mockResolvedValue(
        'valid-token-value',
      );
      authRepo.findRegisteredUserById.mockResolvedValue(undefined);

      await expect(service.refresh(validTokenNonexistentUser)).rejects.toThrow(
        BusinessException,
      );
    });

    it('유효한 리프레시 토큰으로 액세스 토큰을 성공적으로 재발급 받는다', async () => {
      const validRefreshToken = 'valid-refresh-token';
      const expectedAccessToken = 'new-access-token';
      jwtService.verify.mockReturnValue({
        sub: 'validUserId',
        jti: 'validJti',
      });
      refreshTokenService.getRefreshToken.mockResolvedValue(
        'valid-token-value',
      );
      authRepo.findRegisteredUserById.mockResolvedValue(new User());

      jest
        .spyOn(service, 'createAccessToken')
        .mockReturnValue(expectedAccessToken);

      const result = await service.refresh(validRefreshToken);

      expect(result).toEqual({ accessToken: expectedAccessToken });
    });
  });

  describe('login', () => {
    it('유효한 이메일또는 아이디와 비밀번호로 로그인 시 액세스 토큰과 리프레시 토큰을 발급받는다', async () => {
      const email = 'valid@test.com';
      const password = 'validPassword';

      const user = new User();
      user.email = email;
      user.password = 'hashedPassword';
      user.status = UserStatus.VERIFIED_AND_REGISTERED;

      const expectedAccessToken = 'access-token';
      const expectedRefreshToken = 'refresh-token';

      authRepo.findRegisteredUserByEmailOrUsername.mockResolvedValue(user);
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
      const payload = {
        sub: 'uuid',
        iat: Math.floor(Date.now() / 1000),
        jti: 'uuid',
      };
      const expectedToken = `access-token`;

      configService.get.mockReturnValue('15m');
      jwtService.sign.mockReturnValue(expectedToken);

      const result = service.createAccessToken(payload);
      expect(result).toEqual(expectedToken);
    });

    it('refresh token을 생성한다.', () => {
      const payload = {
        sub: 'uuid',
        iat: Math.floor(Date.now() / 1000),
        jti: 'uuid',
      };
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
      user.status = UserStatus.VERIFIED_AND_REGISTERED;

      authRepo.findRegisteredUserByEmailOrUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(argon2.verify).toHaveBeenCalledWith(hashedPassword, password);
      expect(result.status).toBe(2);
      expect(result).toEqual(user);
    });

    it('비밀번호가 틀릴 경우 BusinessException를 반환한다', async () => {
      const email = 'test@test.com';
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword';
      const user = new User();

      user.email = email;
      user.password = hashedPassword;
      user.status = UserStatus.VERIFIED_AND_REGISTERED;
      authRepo.findRegisteredUserByEmailOrUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('handleCodeVerification', () => {
    it('유효하지 않은 번호로 인증을 시도하면 BadRequestException 반환한다', async () => {
      const phoneNumber = '01012345678';
      const invalidInputCode = '123456';
      const realName = 'user';
      verificationService.verifyCode.mockResolvedValue(false);

      await expect(
        service.handleCodeVerification(phoneNumber, realName, invalidInputCode),
      ).rejects.toThrow(BusinessException);
    });

    it('해당 번호로 회원가입 한 유저가 존재하지 않으면 새로 생성한 유저의 정보를 반환한다', async () => {
      const phoneNumber = '01012345678';
      const inputCode = '123456';
      const realName = 'user';

      const user = new User();
      user.email = 'test@example.com';
      user.realName = realName;
      user.phoneNumber = phoneNumber;
      user.track = new Track();

      const verifyCodeResDto: VerifyCodeResDto = {
        email: user.email,
        realName: user.realName,
        role: user.role,
        track: user.track,
      };

      verificationService.verifyCode.mockResolvedValue(true);
      authRepo.findAnyUserByPhoneWithTrack.mockResolvedValue(undefined);
      authRepo.registerUser.mockResolvedValue(user);

      const result = await service.handleCodeVerification(
        phoneNumber,
        realName,
        inputCode,
      );

      expect(result).toEqual(verifyCodeResDto);
    });
    it('해당 번호로 회원가입 하지 않은 유저가 존재하면 유저 정보를 반환한다', async () => {
      const user = new User();
      const track = new Track();
      user.track = track;

      const verifyCodeResDto: VerifyCodeResDto = {
        email: user.email,
        realName: user.realName,
        role: user.role,
        track: user.track,
      };

      const phoneNumber = '01012345678';
      const inputCode = '123456';
      const realName = 'user';

      verificationService.verifyCode.mockResolvedValue(true);
      authRepo.findAnyUserByPhoneWithTrack.mockResolvedValue(user);

      const result = await service.handleCodeVerification(
        phoneNumber,
        realName,
        inputCode,
      );

      expect(result).toEqual(verifyCodeResDto);
      expect(authRepo.updateUserStatus).toHaveBeenCalledWith(
        user.id,
        UserStatus.VERIFIED,
      );
    });
  });

  describe('handlePhoneVerification', () => {
    it('휴대폰 번호가 유효하면 인증번호를 생성, 저장하고 문자를 전송한다', async () => {
      const phoneNumber = '01012345678';
      const verificationCode = '123456';

      (generateVerificationCode as jest.Mock).mockReturnValue(verificationCode);

      await service.handlePhoneVerification(phoneNumber);

      expect(smsService.sendVerificationCode).toHaveBeenCalledWith(
        phoneNumber,
        verificationCode,
      );
    });
  });

  describe('authencticatePhoneNumber', () => {
    it('회원가입이 되어있으면 BusinessException 반환한다', async () => {
      const user = new User();

      authRepo.findRegisteredUserByPhoneNumber.mockResolvedValue(user);

      await expect(
        service.authencticatePhoneNumber('01012345678'),
      ).rejects.toThrow(BusinessException);
    });

    it('번호로 회원가입이 되어있지 않으면 유저 정보를 반환한다', async () => {
      authRepo.findRegisteredUserByPhoneNumber.mockResolvedValue(undefined);

      await service.authencticatePhoneNumber('01012345678');
    });
  });
});
