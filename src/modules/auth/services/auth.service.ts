import { ConflictException, Injectable } from '@nestjs/common';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';
import { smsVerificationRepository } from '../repositories';
import { generateVerificationNumber } from 'src/common/utils';
import { Users } from 'src/modules/user/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SmsService,
    private readonly userService: UserService,
    private readonly smsVerificationRepo: smsVerificationRepository,
  ) {}

  async handlePhoneVerification(phoneNumber: string) {
    // 1. 검증
    const user = await this.authencticatePhoneNumber(phoneNumber);
    // 2. 인증번호 생성
    const generatedNumber = generateVerificationNumber();
    // 3. 인증번호 저장
    await this.setSmsVerification(phoneNumber, generatedNumber);
    // 4. 메세지 전송
    await this.smsService.sendVerificationCode(phoneNumber, generatedNumber);

    return user;
  }

  async setSmsVerification(phoneNumber: string, verificationNumber: string) {
    await this.smsVerificationRepo.setSmsVerification(
      phoneNumber,
      verificationNumber,
    );
  }

  async authencticatePhoneNumber(phoneNumber: string): Promise<Users> {
    const user = await this.userService.findUserByPhoneNumber(phoneNumber);

    if (!user) return {} as Users;

    if (user.isVerified)
      throw new ConflictException('이미 사용하고 있는 번호 입니다.');

    return user;
  }
}
