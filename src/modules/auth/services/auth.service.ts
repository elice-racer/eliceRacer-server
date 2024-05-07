import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';
import { smsVerificationRepository } from '../repositories';
import { generateVerificationCode } from 'src/common/utils';
import { Users } from 'src/modules/user/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SmsService,
    private readonly userService: UserService,
    private readonly smsVerificationRepo: smsVerificationRepository,
  ) {}

  async handleCodeVerification(
    phoneNumber: string,
    inputCode: string,
  ): Promise<Users> {
    await this.verifyCode(phoneNumber, inputCode);
    const user = await this.userService.findUserByPhoneNumber(phoneNumber);
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

  async handlePhoneVerification(phoneNumber: string) {
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
    const user = await this.userService.findUserByPhoneNumber(phoneNumber);

    if (user.isVerified)
      throw new ConflictException('이미 사용하고 있는 번호 입니다.');

    return 'OK';
  }
}
