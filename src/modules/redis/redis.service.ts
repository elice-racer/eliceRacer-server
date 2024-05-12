// redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { ENV_CACHE_URL_KEY } from 'src/common/const';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.initRedis();
  }

  private initRedis() {
    const redisUrl = this.configService.get<string>(ENV_CACHE_URL_KEY);
    this.client = new Redis(redisUrl);

    this.client.on('connect', () => console.log('Connected to Redis'));
    this.client.on('error', (error) => console.error('Redis Error:', error));
    this.client.on('reconnecting', () => console.log('Reconnecting to Redis'));
    this.client.on('end', () => console.log('Disconnected from Redis'));
  }
}
