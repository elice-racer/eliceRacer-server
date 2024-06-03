import { Module } from '@nestjs/common';
import { TeamController } from './controllers/team.controller';
import { TeamService } from './services/team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamRepository } from './repositories/team.repository';
import { UserModule } from '../user/user.module';
import { TrackModule } from '../track/track.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team]),
    UserModule,
    TrackModule,
    ProjectModule,
  ],
  controllers: [TeamController],
  providers: [TeamService, TeamRepository],
  exports: [TeamRepository],
})
export class TeamModule {}
