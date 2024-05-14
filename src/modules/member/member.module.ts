import { Module } from '@nestjs/common';
import { MemberService } from './services/member.service';
import { UserModule } from '../user/user.module';
import { MemberController } from './controllers/member.controller';
import { TrackModule } from '../track/track.module';

@Module({
  imports: [UserModule, TrackModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
