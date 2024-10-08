import { HttpStatus, Injectable } from '@nestjs/common';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { User, UserStatus } from 'src/modules/user/entities';
import { generateVerificationCode } from 'src/common/utils';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import {
  ENV_ACCESS_TOKEN_EXPIRY,
  ENV_JWT_SECRET_KEY,
  ENV_REFRESH_TOKEN_EXPIRY,
} from 'src/common/const';
import { TokenPayload, TokenPayloadRes } from '../types';
import { SendPasswordUpdateSmsReqDto, VerifyCodeResDto } from '../dto';
import { VerificationService } from './verification.service';
import { RefreshTokenService } from './refresh-token.service';
import { AuthRepository } from '../repositories';
import { BusinessException } from 'src/exception';
import { v4 as uuidv4 } from 'uuid';
import { updatePasswordReqDto } from '../dto/requests/update-password-req.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly verificationService: VerificationService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly authRepo: AuthRepository,
  ) {}

  async logout(refreshToken: string): Promise<void> {
    const payloadRes: TokenPayloadRes = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
    });

    await this.refreshTokenService.deleteRefreshToken(
      `refreshToken:${payloadRes.jti}`,
    );
  }

  async refresh(refreshToken: string) {
    const payloadRes: TokenPayloadRes = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
    });

    if (!payloadRes || !payloadRes.sub) {
      throw new BusinessException(
        'auth',
        `유효하지 않은 토큰`,
        `유효하지 않은 토큰`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const isNotExpired = await this.refreshTokenService.getRefreshToken(
      `refreshToken:${payloadRes.jti}`,
    );

    if (!isNotExpired)
      throw new BusinessException(
        'auth',
        `만료된 토큰`,
        `만료된 토큰`,
        HttpStatus.UNAUTHORIZED,
      );

    const user = await this.authRepo.findRegisteredUserById(payloadRes.sub);
    if (!user)
      throw new BusinessException(
        'auth',
        `유저를 찾을 수 없습니다`,
        `유저를 찾을 수 없습니다`,
        HttpStatus.BAD_REQUEST,
      );

    const payload: TokenPayload = this.createTokenPayload(user.id);

    const accessToken = this.createAccessToken(payload);
    return accessToken;
  }

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);

    const payload: TokenPayload = this.createTokenPayload(user.id);
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.refreshTokenService.setRefreshToken(
      `refreshToken:${payload.jti}`,
      refreshToken,
      60 * 60 * 24 * 3, //3일
    );

    return { accessToken, refreshToken };
  }

  //access token 생성
  createAccessToken(payload: TokenPayload): string {
    const expiresIn = this.configService.get<string>(ENV_ACCESS_TOKEN_EXPIRY);

    return this.jwtService.sign(payload, { expiresIn });
  }

  //refresh token 생성
  createRefreshToken(payload: TokenPayload): string {
    const expiresIn = this.configService.get<string>(ENV_REFRESH_TOKEN_EXPIRY);

    return this.jwtService.sign(payload, { expiresIn });
  }

  //로그인시 사용
  async validateUser(identifier: string, password: string): Promise<User> {
    const user =
      await this.authRepo.findRegisteredUserByEmailOrUsername(identifier);
    if (!user || !(await argon2.verify(user.password, password)))
      throw new BusinessException(
        'auth',
        `유저를 찾을 수 없습니다`,
        `유저를 찾을 수 없습니다`,
        HttpStatus.BAD_REQUEST,
      );

    return user;
  }

  // 인증번호 검증
  async handleCodeVerification(
    phoneNumber: string,
    realName: string,
    inputCode: string,
  ): Promise<VerifyCodeResDto> {
    const result = await this.verificationService.verifyCode(
      `phoneCode:${phoneNumber}`,
      inputCode,
    );
    if (!result)
      throw new BusinessException(
        'auth',
        `유효하지 않은 번호입니다`,
        `유효하지 않은 번호입니다`,
        HttpStatus.BAD_REQUEST,
      );
    await this.verificationService.deleteVerificationCode(
      `phoneCode:${phoneNumber}`,
    );

    const user = await this.authRepo.findAnyUserByPhoneWithTrack(phoneNumber);

    // 등록되어있지 않은 유저는 번호 등록
    if (!user) {
      const registeredUser = await this.authRepo.registerUser(
        phoneNumber,
        realName,
      );
      return {
        email: registeredUser.email,
        realName: registeredUser.realName,
        role: registeredUser.role,
        track: registeredUser.track,
      };
    }

    //기존에 등록된 유저는 상태만 변경
    await this.authRepo.updateUserStatus(user.id, UserStatus.VERIFIED);
    return {
      email: user.email,
      realName: user.realName,
      role: user.role,
      track: user.track ? user.track : null,
    };
  }

  async handlePhoneVerification(phoneNumber: string): Promise<void> {
    // 1. 검증
    await this.authencticatePhoneNumber(phoneNumber);
    // 2. 인증번호 생성
    const generatedCode = generateVerificationCode();
    // 3. 인증번호 저장
    await this.verificationService.setVerificationCode(
      `phoneCode:${phoneNumber}`,
      generatedCode,
      60 * 5, // 5분,
    );
    // 4. 메세지 전송
    await this.smsService.sendVerificationCode(phoneNumber, generatedCode);
  }

  async handlePasswordResetCode(
    phoneNumber: string,
    inputCode: string,
  ): Promise<boolean> {
    const result = await this.verificationService.verifyCode(
      `passwordCode:${phoneNumber}`,
      inputCode,
    );
    if (!result)
      throw new BusinessException(
        'auth',
        `유효하지 않은 번호입니다`,
        `유효하지 않은 번호입니다`,
        HttpStatus.BAD_REQUEST,
      );

    await this.verificationService.deleteVerificationCode(
      `passwordCode:${phoneNumber}`,
    );

    return true;
  }
  async handlePasswordResetVerification(dto: SendPasswordUpdateSmsReqDto) {
    const { identifier, phoneNumber } = dto;

    const userId = await this.checkPhoneNumberMatch(identifier, phoneNumber);

    const generatedCode = generateVerificationCode();
    // 3. 인증번호 저장
    await this.verificationService.setVerificationCode(
      `passwordCode:${phoneNumber}`,
      generatedCode,
      60 * 10, // 10분,
    );
    // 4. 메세지 전송
    await this.smsService.sendVerificationCode(phoneNumber, generatedCode);

    return userId;
  }

  async authencticatePhoneNumber(phoneNumber: string): Promise<void> {
    const user =
      await this.authRepo.findRegisteredUserByPhoneNumber(phoneNumber);

    if (user)
      throw new BusinessException(
        'auth',
        `이미 가입된 번호입니다`,
        `이미 가입된 번호입니다`,
        HttpStatus.CONFLICT,
      );
  }

  createTokenPayload(userId: string): TokenPayload {
    return {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
    };
  }

  async checkPhoneNumberMatch(identifier: string, phoneNumber: string) {
    const user =
      await this.authRepo.findRegisteredUserByEmailOrUsername(identifier);

    if (user.phoneNumber !== phoneNumber) {
      throw new BusinessException(
        'auth',
        `등록된 번호와 일치하지 않습니다`,
        `등록된 번호와 일치하지 않습니다`,
        HttpStatus.FORBIDDEN,
      );
    }

    return user.id;
  }

  async handleUpdatePassword(dto: updatePasswordReqDto) {
    const user = await this.authRepo.findRegisteredUserById(dto.userId);

    if (user.phoneNumber !== dto.phoneNumber)
      throw new BusinessException(
        'auth',
        `인증한 핸드폰 번호와 일치하지 않습니다`,
        `인증한 핸드폰 번호와 일치하지 않습니다`,
        HttpStatus.FORBIDDEN,
      );
    await this.updatePassword(user, dto.password);
  }

  async updatePassword(user: User, password: string) {
    const hashedPassword = await argon2.hash(password);

    return this.authRepo.updateUserPassword(user, hashedPassword);
  }

  async getIdentifier(phoneNumber: string) {
    const user =
      await this.authRepo.findRegisteredUserByPhoneNumber(phoneNumber);

    if (!user) {
      throw new BusinessException(
        'auth',
        `등록된 번호가 존재하지 않습니다`,
        `등록된 번호가 존재하지 않습니다`,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }
}
