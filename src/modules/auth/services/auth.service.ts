import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';
import { SmsVerificationRepository } from '../repositories';
import { User } from 'src/modules/user/entities';
import { generateVerificationCode } from 'src/common/utils';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import {
  ENV_ACCESS_TOKEN_EXPIRY,
  ENV_JWT_SECRET_KEY,
  ENV_REFRESH_TOKEN_EXPIRY,
} from 'src/common/const';
import { TokenPayload, TokenPayloadRes } from '../types';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SmsService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly smsVerificationRepo: SmsVerificationRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async refresh(refreshToken: string) {
    const payloadRes: TokenPayloadRes = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
    });

    if (!payloadRes || !payloadRes.sub) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
    const isNotExpired = await this.refreshTokenRepo.getRefreshToken(
      payloadRes.jti,
    );

    if (!isNotExpired)
      throw new UnauthorizedException('유효하지 않은 토큰입니다');

    const user = await this.userService.findUserById(payloadRes.sub);
    if (!user) throw new UnauthorizedException('유효하지 않은 유저입니다');

    const payload: TokenPayload = this.createTokenPayload(user.id);

    const accessToken = this.createAccessToken(payload);
    return { accessToken };
  }

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);

    const payload: TokenPayload = this.createTokenPayload(user.id);
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.refreshTokenRepo.setRefreshToken(
      payload.jti,
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
    const user = await this.userService.findUserByEmailOrUsername(identifier);

    if (!user || !(await argon2.verify(user.password, password)))
      throw new UnauthorizedException('유효하지 않은 유저입니다');

    return user;
  }

  async handleCodeVerification(
    phoneNumber: string,
    inputCode: string,
  ): Promise<User> {
    await this.verifyCode(phoneNumber, inputCode);
    const user =
      await this.userService.findUserByPhoneNumberWithTrack(phoneNumber);
    //TODO phoneVerificationResDto 생성 필요
    return user;
  }

  async verifyCode(phoneNumber: string, inputCode: string) {
    const storedCode =
      await this.smsVerificationRepo.getVerificationCode(phoneNumber);

    if (storedCode === null)
      throw new NotFoundException('인증번호를 찾을 수 없습니다');

    if (inputCode !== storedCode) {
      throw new BadRequestException('인증번호가 일치하지 않습니다');
    }
    return 'OK';
  }

  async handlePhoneVerification(phoneNumber: string): Promise<string> {
    // 1. 검증
    await this.authencticatePhoneNumber(phoneNumber);
    // 2. 인증번호 생성
    const generatedCode = generateVerificationCode();
    // 3. 인증번호 저장
    await this.setVerificationCode(phoneNumber, generatedCode);
    // 4. 메세지 전송
    await this.smsService.sendVerificationCode(phoneNumber, generatedCode);

    return 'Success';
  }

  async setVerificationCode(phoneNumber: string, inputCode: string) {
    await this.smsVerificationRepo.setVerificationCode(phoneNumber, inputCode);
  }

  async authencticatePhoneNumber(phoneNumber: string): Promise<string> {
    const user =
      await this.userService.findUserByPhoneNumberIncludingNonMembers(
        phoneNumber,
      );

    if (user) throw new ConflictException('이미 사용하고 있는 번호 입니다.');

    return 'OK';
  }

  createTokenPayload(userId: string): TokenPayload {
    return {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
    };
  }
}
