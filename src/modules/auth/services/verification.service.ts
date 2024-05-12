import { Injectable } from '@nestjs/common';
import { VerificationRepository } from '../repositories';

@Injectable()
export class VerificationService {
  constructor(private readonly verificationRepo: VerificationRepository) {}

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
