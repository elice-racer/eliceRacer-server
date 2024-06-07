import { Injectable } from '@nestjs/common';
import { VerificationRepository } from '../repositories';

@Injectable()
export class VerificationService {
  constructor(private readonly verificationRepo: VerificationRepository) {}

  async verifyCode(key: string, inputCode: string): Promise<boolean> {
    const storedCode = await this.getVerificationCode(key);
    if (storedCode !== inputCode || storedCode === null) {
      return false;
    }
    return true;
  }

  async getVerificationCode(key: string): Promise<string> {
    return this.verificationRepo.getVerificationCode(key);
  }

  async setVerificationCode(
    key: string,
    value: string,
    ttl: number,
  ): Promise<void> {
    this.verificationRepo.setVerificationCode(key, value, ttl);
  }

  async deleteVerificationCode(key: string) {
    this.verificationRepo.deleteVerificationCode(key);
  }
}
