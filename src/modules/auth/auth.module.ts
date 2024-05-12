import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SmsModule } from '../sms/sms.module';
import { UserModule } from '../user/user.module';
import { VerificationRepository } from './repositories';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_ACCESS_TOKEN_EXPIRY, ENV_JWT_SECRET_KEY } from 'src/common/const';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { VerificationService } from './services/verification.service';
import { RefreshTokenService } from './services/refresh-token.service';
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
  providers: [
    AuthService,
    VerificationService,
    RefreshTokenService,
    VerificationRepository,
    RefreshTokenRepository,
  ],
  exports: [VerificationService, RefreshTokenService],
})
export class AuthModule {}
