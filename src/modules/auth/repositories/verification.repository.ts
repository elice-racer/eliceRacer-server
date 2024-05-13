import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class VerificationRepository {
  // constructor() {}
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  //TODO return값
  async getVerificationCode(key: string): Promise<string> {
    return this.cacheManager.get(key);
  }
  async setVerificationCode(
    key: string,
    value: string,
    ttl: number,
  ): Promise<void> {
    return this.cacheManager.set(key, value, ttl);
  }
}
