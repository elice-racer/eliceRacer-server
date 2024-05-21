import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import coolsms from 'coolsms-node-sdk';
import { ConfigService } from '@nestjs/config';
import {
  ENV_SMS_API_KEY,
  ENV_SMS_API_SECRET_KEY,
  ENV_SMS_FROM_NUMBER_KEY,
} from 'src/common/const';
import { BusinessException } from 'src/exception';

@Injectable()
export class SmsService {
  private messageService;
  constructor(private readonly configService: ConfigService) {
    this.messageService = new coolsms(
      configService.get<string>(ENV_SMS_API_KEY),
      configService.get<string>(ENV_SMS_API_SECRET_KEY),
    );
  }

  async sendVerificationCode(
    to: string,
    verificationNumber: string,
  ): Promise<string> {
    const from = this.configService.get<string>(ENV_SMS_FROM_NUMBER_KEY);
    const text = `[elicerRacer] 인증번호는 [${verificationNumber}]입니다.`;

    try {
      const response = await this.messageService.sendOne({
        to,
        from,
        text,
      });

      if (response.statusCode !== '2000') {
        throw new BusinessException(
          'sms',
          '문자 전송 실패',
          '문자 전송에 실패했습니다',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return 'Success';
    } catch (error) {
      throw new HttpException(
        `문자 전송 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
