import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ENV_CACHE_HOST_KEY,
  ENV_CACHE_PASSWORD_KEY,
  ENV_CACHE_PORT_KEY,
  ENV_CACHE_USERNAME_KEY,
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './common/const';
import * as redisStore from 'cache-manager-ioredis';
import { SmsModule } from './modules/sms/sms.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors';
import { AdminModule } from './modules/admin/admin.module';
import { TrackModule } from './modules/track/track.module';
import { MemberModule } from './modules/member/member.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { ProjectModule } from './modules/project/project.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(ENV_DB_HOST_KEY),
        port: configService.get<number>(ENV_DB_PORT_KEY),
        username: configService.get<string>(ENV_DB_USERNAME_KEY) || '',
        password: configService.get<string>(ENV_DB_PASSWORD_KEY) || '',
        database: configService.get<string>(ENV_DB_DATABASE_KEY),
        autoLoadEntities: true,
        synchronize: true,
        //TODO 삼항연산자 dev에서만 되게
      }),
    }),

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
    AuthModule,
    UserModule,
    SmsModule,
    AdminModule,
    TrackModule,
    MemberModule,
    AdminModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
