import { Expose } from 'class-transformer';
import { DetailTeamResDto } from 'src/modules/team/dto';
import { TrackResDto } from 'src/modules/track/dto';

export class OutputUserDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

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
  role: string;

  @Expose()
  status: number;

  @Expose()
  track: TrackResDto;

  @Expose()
  teams: DetailTeamResDto;
}
