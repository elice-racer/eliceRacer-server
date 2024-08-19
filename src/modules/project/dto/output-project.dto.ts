import { Expose, Type } from 'class-transformer';
import { OutputUserDto } from 'src/modules/user/dto';

export class TrackDto {
  @Expose()
  id: string;
  @Expose()
  trackName: string;
  @Expose()
  cardinalNo: number;
}

export class TeamDto {
  @Expose()
  id: string;

  @Expose()
  teamName: string;

  @Expose()
  teamNumber: string;

  @Expose()
  notion: string;

  @Expose()
  gitlab: string;

  @Expose()
  @Type(() => OutputUserDto)
  users: OutputUserDto[];
}

export class OutputProjectDto {
  @Expose()
  id: string;

  @Expose()
  projectName: string;

  @Expose()
  round: number;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  track: TrackDto;

  @Expose()
  @Type(() => TeamDto)
  teams: TeamDto;
}
