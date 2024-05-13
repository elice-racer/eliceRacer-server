import { Module } from '@nestjs/common';
import { MemberService } from './services/member.service';
import { UserModule } from '../user/user.module';
import { MemberController } from './controllers/member.controller';

@Module({
  imports: [UserModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
