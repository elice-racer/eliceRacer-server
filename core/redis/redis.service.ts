import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';
import { ENV_CACHE_HOST_KEY, ENV_CACHE_PORT_KEY } from 'src/common/const';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: configService.get<string>(ENV_CACHE_HOST_KEY),
      port: configService.get<number>(ENV_CACHE_PORT_KEY),
    });
  }

  onModuleInit() {
    this.client.on('connect', () => console.log('Connected to Redis'));
  }

  onModuleDestroy() {
    this.client.quit();
  }

  getPublisher(): RedisClient {
    return this.client;
  }

  getSubscriber(): RedisClient {
    return this.client.duplicate();
  }
}
