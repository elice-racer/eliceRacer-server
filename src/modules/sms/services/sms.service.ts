import { Injectable } from '@nestjs/common';
import coolsms from 'coolsms-node-sdk';
import { ConfigService } from '@nestjs/config';
import {
  ENV_SMS_API_KEY,
  ENV_SMS_API_SECRET_KEY,
  ENV_SMS_FROM_NUMBER_KEY,
} from 'src/common/const';

@Injectable()
export class SmsService {
  private messageService;
  constructor(private readonly configService: ConfigService) {
    this.messageService = new coolsms(
      configService.get<string>(ENV_SMS_API_KEY),
      configService.get<string>(ENV_SMS_API_SECRET_KEY),
    );
  }

  async sendVerificationCode(to: string, verificationNumber: string) {
    const from = this.configService.get<string>(ENV_SMS_FROM_NUMBER_KEY);
    const text = `[elicerRacer] 인증번호는 [${verificationNumber}]입니다.`;

    const response = await this.messageService.sendOne({
      to,
      from,
      text,
    });

    if (response.statusCode !== '2000') return '에러'; //TODO exception

    return 'Success';
  }
}
