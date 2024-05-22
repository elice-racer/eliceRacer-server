import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../user/entities';
import {
  ENV_BASE_URL_KEY,
  ENV_MAIL_PASS_KEY,
  ENV_MAIL_USER_KEY,
} from 'src/common/const';

@Injectable()
export class MailService {
  private transporter;
  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      pool: true,
      secure: false,
      service: 'gmail',
      auth: {
        user: configService.get<string>(ENV_MAIL_USER_KEY),
        pass: configService.get<string>(ENV_MAIL_PASS_KEY),
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<boolean> {
    const mailOptions = {
      from: 'EliceRacer',
      to,
      subject,
      text,
      html,
    };

    await this.transporter.sendMail(mailOptions);
    return true;
  }

  async sendVerificationEmail(
    user: User,
    token: string,
    type: string,
  ): Promise<void> {
    //TODO 삼항연산자로 개발환경에 따라 baseURL
    const url = this.configService.get<string>(ENV_BASE_URL_KEY);
    const baseUrl = `${url}/api/${type}/verify-email?id=${user.id}&token=${token}`;
    const subject = '[EliceRacer] 이메일 인증을 완료해주세요.';
    const html = `
    <h2>환영합니다 ${user.realName}님</h2>
    <p>버튼을 눌러 이메일 인증을 완료해주세요.</p>
    <a href=${baseUrl}> Click here</a>
    </div>`;

    try {
      await this.sendMail(user.email, subject, '', html);
    } catch (error) {
      throw new HttpException(
        `메일 전송 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
