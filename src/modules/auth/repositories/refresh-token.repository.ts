import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RefreshTokenRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getRefreshToken(key: string): Promise<string> {
    return this.cacheManager.get(key);
  }
  async setRefreshToken(
    key: string,
    value: string,
    ttl: number,
  ): Promise<void> {
    return this.cacheManager.set(key, value, { ttl } as any);
  }

  async deleteRefreshToken(key: string): Promise<void> {
    this.cacheManager.del(key);
  }
}
