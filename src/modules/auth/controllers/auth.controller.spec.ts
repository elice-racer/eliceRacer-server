import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  LoginReqDto,
  LoginResDto,
  LogoutReqDto,
  RefreshReqDto,
  RefreshResDto,
  VerifyCodeReqDto,
  VerifyCodeResDto,
} from '../dto';
import { VerificationService } from '../services/verification.service';
import { RefreshTokenService } from '../services/refresh-token.service';
import { AuthRepository } from '../repositories';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        SmsService,
        JwtService,
        ConfigService,
        VerificationService,
        RefreshTokenService,
        AuthRepository,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendVerificationCode', () => {
    it('전화번호로 인증 코드를 발송한다.', async () => {
      authService.handlePhoneVerification.mockResolvedValue('Success');
      const result = await controller.sendVerificationCode('01012345678');
      expect(result).toBe('Success');
    });
  });

  describe('verifyCode', () => {
    it('인증 번호가 맞는지 검증한다', async () => {
      const reqDto: VerifyCodeReqDto = {
        phoneNumber: '01012345678',
        authCode: '123456',
      };
      const resDto: VerifyCodeResDto = {
        email: 'user@example.com',
        realName: '홍길동',
        tracks: [],
      };

      authService.handleCodeVerification.mockResolvedValue(resDto);

      const result = await controller.verifyAuthCode(reqDto);

      expect(authService.handleCodeVerification).toHaveBeenCalledWith(
        reqDto.phoneNumber,
        reqDto.authCode,
      );
      expect(result).toEqual(resDto);
    });
  });

  describe('login', () => {
    it('올바른 아이디 또는 이메일, 비밀번호를 이용해서 로그인에 성공한다', async () => {
      const reqDto: LoginReqDto = {
        identifier: 'user@example.com',
        password: 'password',
      };
      const resDto: LoginResDto = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
      authService.login.mockResolvedValue(resDto);
      const result = await controller.login(reqDto);

      expect(result).toBe(resDto);
    });
  });

  describe('refresh', () => {
    it('리프레시 토큰을 이용해 액세스 토큰을 발급한다', async () => {
      const reqDto: RefreshReqDto = {
        refreshToken: 'refreshToken',
      };
      const resDto: RefreshResDto = {
        accessToken: 'accessToken',
      };

      authService.refresh.mockResolvedValue(resDto);
      const result = await controller.refresh(reqDto);
      expect(result).toBe(resDto);
    });
  });

  describe('logout', () => {
    it('로그아웃한다', async () => {
      const resDto: LogoutReqDto = { refreshToken: 'refreshToken' };
      await controller.logout(resDto);
    });
  });
});
