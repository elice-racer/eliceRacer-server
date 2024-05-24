import { Module } from '@nestjs/common';
import { MemberService } from './services/member.service';
import { UserModule } from '../user/user.module';
import { TrackModule } from '../track/track.module';

@Module({
  imports: [UserModule, TrackModule],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
