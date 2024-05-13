import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VerificationRepository } from '../repositories';

@Injectable()
export class VerificationService {
  constructor(private readonly verificationRepo: VerificationRepository) {}

  async verifyCode(key: string, inputCode: string): Promise<string> {
    const storedCode = await this.getVerificationCode(key);

    if (storedCode === null)
      throw new NotFoundException('인증번호를 찾을 수 없습니다');

    if (storedCode !== inputCode) {
      throw new BadRequestException('인증번호가 일치하지 않습니다');
    }
    return 'OK';
  }

  async getVerificationCode(key: string): Promise<string> {
    return this.verificationRepo.getVerificationCode(key);
  }

  async setVerificationCode(
    key: string,
    value: string,
    ttl: number,
  ): Promise<void> {
    return this.verificationRepo.setVerificationCode(key, value, ttl);
  }
}
