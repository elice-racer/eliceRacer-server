import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { AdminRepository } from './repositories';
import { TrackModule } from '../track/track.module';
import { MemberModule } from '../member/member.module';
import { TeamModule } from '../team/team.module';
import { ProjectModule } from '../project/project.module';
import { NoticeModule } from '../notice/notice.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MailModule,
    TrackModule,
    MemberModule,
    UserModule,
    TeamModule,
    ProjectModule,
    NoticeModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
})
export class AdminModule {}
