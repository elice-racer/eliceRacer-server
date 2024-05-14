import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SmsModule } from '../sms/sms.module';
import { UserModule } from '../user/user.module';
import { AuthRepository, VerificationRepository } from './repositories';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_ACCESS_TOKEN_EXPIRY, ENV_JWT_SECRET_KEY } from 'src/common/const';
import { RefreshTokenRepository } from './repositories/';
import { VerificationService } from './services/verification.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
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

    JwtStrategy,
    AuthRepository,
  ],
  exports: [VerificationService, RefreshTokenService],
})
export class AuthModule {}
