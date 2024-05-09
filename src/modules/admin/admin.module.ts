import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { VerifyEmailRepository } from './repositories/verify-email.repository';

@Module({
  imports: [UserModule, MailModule],
  controllers: [AdminController],
  providers: [AdminService, VerifyEmailRepository],
})
export class AdminModule {}
