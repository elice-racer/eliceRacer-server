import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';
import { UserRepository } from './repositories';
import { TrackModule } from '../track/track.module';
import { Skill } from './entities/skill.entity';
import { SkillRepository } from './repositories/skill.repository';
import { SkillService } from './services/skill.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Skill]), TrackModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, SkillRepository, SkillService],
  exports: [UserService, UserRepository],
})
export class UserModule {}
