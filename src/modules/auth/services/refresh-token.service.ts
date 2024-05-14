import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../repositories';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

  async getRefreshToken(key: string): Promise<string> {
    return this.refreshTokenRepo.getRefreshToken(key);
  }
  async setRefreshToken(
    key: string,
    value: string,
    ttl: number,
  ): Promise<void> {
    return this.refreshTokenRepo.setRefreshToken(key, value, ttl);
  }
  async deleteRefreshToken(key: string): Promise<void> {
    return this.refreshTokenRepo.deleteRefreshToken(key);
  }
}
