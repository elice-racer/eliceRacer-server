import { Expose } from 'class-transformer';
import { DetailTeamResDto } from 'src/modules/team/dto';
import { TrackResDto } from 'src/modules/track/dto';
import { OutputSkillDto } from './ouput-skill.dto';
import { UserRole } from '../entities';

export class OutputUserDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  realName: string;

  @Expose()
  comment: string;

  @Expose()
  position: string;

  @Expose()
  github: string;

  @Expose()
  blog: string;

  @Expose()
  sns: string;

  @Expose()
  description: string;

  @Expose()
  tmi: string;

  @Expose()
  profileImage: string;

  @Expose()
  role: UserRole;

  @Expose()
  status: number;

  @Expose()
  skills: OutputSkillDto;

  @Expose()
  track: TrackResDto;

  @Expose()
  teams: DetailTeamResDto;
}
