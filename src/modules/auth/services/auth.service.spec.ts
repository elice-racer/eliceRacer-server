import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';
import { User, UserStatus } from 'src/modules/user/entities';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { generateVerificationCode } from 'src/common/utils';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Track } from 'src/modules/track/entities';
import { VerifyCodeResDto } from '../dto';
import { RefreshTokenService } from './refresh-token.service';
import { VerificationService } from './verification.service';

jest.unmock('./auth.service');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let smsService: jest.Mocked<SmsService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let verificationService: jest.Mocked<VerificationService>;

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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    smsService = module.get(SmsService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    verificationService = module.get(VerificationService);
    refreshTokenService = module.get(RefreshTokenService);
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
    it('유효하지 않은 refresh token으로 재발급을 시도하면 UnauthorizedException를 반환한다', async () => {
      const invalidRefreshToken = 'invalid-refresh-token';

      await expect(service.refresh(invalidRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('유효기간이 지난 refresh token으로 재발급을 시도하면 UnauthorizedException를 반환한다', async () => {
      const invalidRefreshToken = 'invalid-refresh-token';

      refreshTokenService.getRefreshToken.mockResolvedValue(null);

      await expect(service.refresh(invalidRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('유효한 리프레시 토큰을 이용해서 액세스 토큰을 재발급한다', async () => {
      const refreshToken = 'valid-refresh-token';
      const expectedAccessToken = 'new-access-token';

      jwtService.verify.mockReturnValue({
        sub: 'userId-uuid',
        jti: 'jwt-uuid',
      });

      // refreshTokenRepo.getRefreshToken 모의 처리
      jest
        .spyOn(refreshTokenService, 'getRefreshToken')
        .mockResolvedValue(refreshToken);
      // createAccessToken 모의 처리
      jest
        .spyOn(service, 'createAccessToken')
        .mockReturnValue(expectedAccessToken);

      userService.findUserById.mockResolvedValue(new User());

      const result = await service.refresh(refreshToken);

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

      userService.findUserByEmailOrUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(argon2.verify).toHaveBeenCalledWith(hashedPassword, password);
      expect(result.status).toBe(2);
      expect(result).toEqual(user);
    });

    it('비밀번호가 틀릴 경우 UnauthorizedException를 반환한다', async () => {
      const email = 'test@test.com';
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword';
      const user = new User();

      user.email = email;
      user.password = hashedPassword;
      user.status = UserStatus.VERIFIED_AND_REGISTERED;
      userService.findUserByEmailOrUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('handleCodeVerification', () => {
    it('유효하지 않은 번호로 인증을 시도하면 BadRequestException 반환한다', async () => {
      verificationService.verifyCode.mockResolvedValue(false);

      await expect(
        service.handleCodeVerification('01012345678', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('해당 번호로 회원가입 한 유저가 존재하지 않으면 비어있는 유저 정보를 반환한다', async () => {
      const verifyCodeResDto = {
        email: '',
        realName: '',
        tracks: [],
      };

      const phoneNumber = '01012345678';
      const inputCode = '123456';

      verificationService.verifyCode.mockResolvedValue(true);
      userService.findAnyUserByPhoneWithTrack.mockResolvedValue(undefined);

      const result = await service.handleCodeVerification(
        phoneNumber,
        inputCode,
      );

      expect(result).toEqual(verifyCodeResDto);
    });

    it('해당 번호로 회원가입 하지 않은 유저가 존재하면 유저 정보를 반환한다', async () => {
      const user = new User();
      const track = new Track();
      user.tracks = [track];

      const verifyCodeResDto: VerifyCodeResDto = {
        email: user.email,
        realName: user.realName,
        tracks: user.tracks
          ? user.tracks.map((track) => ({
              trackName: track.trackName,
              generation: track.generation,
            }))
          : [],
      };

      const phoneNumber = '01012345678';
      const inputCode = '123456';

      verificationService.verifyCode.mockResolvedValue(true);
      userService.findAnyUserByPhoneWithTrack.mockResolvedValue(user);

      const result = await service.handleCodeVerification(
        phoneNumber,
        inputCode,
      );

      expect(result).toEqual(verifyCodeResDto);
      expect(userService.mergeAfterVerification).toHaveBeenCalledWith(user);
    });
  });

  describe('handlePhoneVerification', () => {
    it('휴대폰 번호가 유효하면 인증번호를 생성, 저장하고 문자를 전송한다', async () => {
      const phoneNumber = '01012345678';
      const verificationCode = '123456';

      (generateVerificationCode as jest.Mock).mockReturnValue(verificationCode);
      const result = await service.handlePhoneVerification(phoneNumber);

      expect(smsService.sendVerificationCode).toHaveBeenCalledWith(
        phoneNumber,
        verificationCode,
      );

      expect(result).toEqual('Success');
    });
  });

  describe('authencticatePhoneNumber', () => {
    it('회원가입이 되어있으면 ConflictException 반환한다', async () => {
      const user = new User();

      userService.findUserByPhoneNumber.mockResolvedValue(user);

      await expect(
        service.authencticatePhoneNumber('01012345678'),
      ).rejects.toThrow(ConflictException);
    });

    it('번호로 회원가입이 되어있지 않으면 유저 정보를 반환한다', async () => {
      userService.findUserByPhoneNumber.mockResolvedValue(undefined);

      const result = await service.authencticatePhoneNumber('01012345678');

      expect(result).toEqual('OK');
    });
  });
});
