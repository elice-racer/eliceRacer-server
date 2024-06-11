import { Expose } from 'class-transformer';
import { TrackResDto } from 'src/modules/track/dto';

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
  track: TrackResDto;
}
