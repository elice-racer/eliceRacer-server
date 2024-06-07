// redis.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import {
  ENV_CACHE_HOST_KEY,
  ENV_CACHE_PASSWORD_KEY,
  ENV_CACHE_PORT_KEY,
  ENV_CACHE_USERNAME_KEY,
} from 'src/common/const';
// import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>(ENV_CACHE_HOST_KEY),
        port: configService.get<number>(ENV_CACHE_PORT_KEY),
        username: configService.get<string>(ENV_CACHE_USERNAME_KEY),
        password: configService.get<string>(ENV_CACHE_PASSWORD_KEY),
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),
  ],
  //   providers: [RedisService],
  exports: [CacheModule],
})
export class RedisModule {}
