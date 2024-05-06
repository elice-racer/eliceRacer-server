import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class smsVerificationRepository {
  // constructor() {}
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  //TODO return값
  async getSmsVerification(key: string) {
    return this.cacheManager.get(key);
  }
  async setSmsVerification(key: string, value: string): Promise<void> {
    return this.cacheManager.set(key, value);
  }
}
