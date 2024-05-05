import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SmsModule } from '../sms/sms.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SmsModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
