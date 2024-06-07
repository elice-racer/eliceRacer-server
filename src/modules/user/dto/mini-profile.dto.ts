import { Expose } from 'class-transformer';
import { OutputTeamDto } from 'src/modules/team/dto';
import { TrackDto } from 'src/modules/track/dto';

export class MiniProfileDto {
  @Expose()
  id: string;

  @Expose()
  realName: string;

  @Expose()
  github: string;

  @Expose()
  skill: string;

  @Expose()
  track: TrackDto;

  @Expose()
  team: OutputTeamDto[];
}
