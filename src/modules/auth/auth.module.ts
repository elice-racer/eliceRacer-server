import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SmsModule } from '../sms/sms.module';
import { UserModule } from '../user/user.module';
import { SmsVerificationRepository } from './repositories';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_ACCESS_TOKEN_EXPIRY, ENV_JWT_SECRET_KEY } from 'src/common/const';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(ENV_JWT_SECRET_KEY),
        signOptions: {
          expiresIn: configService.get<string>(ENV_ACCESS_TOKEN_EXPIRY),
        },
      }),
    }),
    SmsModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SmsVerificationRepository, RefreshTokenRepository],
})
export class AuthModule {}
