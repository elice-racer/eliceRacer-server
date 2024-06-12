import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SmsModule } from './modules/sms/sms.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors';
import { AdminModule } from './modules/admin/admin.module';
import { TrackModule } from './modules/track/track.module';
import { MemberModule } from './modules/member/member.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { ProjectModule } from './modules/project/project.module';
import { TeamModule } from './modules/team/team.module';
import { DatabaseModule } from 'core/databse/database.module';
import { RedisModule } from 'core/redis/redis.module';
import { NoticeModule } from './modules/notice/notice.module';
import { ChatModule } from './modules/chat/chat.module';
import { OfficehourModule } from './modules/officehour/officehour.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    RedisModule,

    AuthModule,
    UserModule,
    SmsModule,
    AdminModule,
    TrackModule,
    MemberModule,
    AdminModule,
    ProjectModule,
    TeamModule,
    ChatModule,
    NoticeModule,
    OfficehourModule,
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
