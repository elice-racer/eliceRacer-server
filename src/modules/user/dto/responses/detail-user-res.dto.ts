import { Expose } from 'class-transformer';
import { OutputUserDto } from './output-user.dto';
import { OutputTrackDto } from 'src/modules/track/dto';
import { OutputSkillDto } from './ouput-skill.dto';
import { DetailTeamResDto } from 'src/modules/team/dto';

export class DetailUserResDto extends OutputUserDto {
  @Expose()
  skills: OutputSkillDto;

  @Expose()
  track: OutputTrackDto;

  @Expose()
  teams: DetailTeamResDto;
}
