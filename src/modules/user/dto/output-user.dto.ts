import { Expose } from 'class-transformer';
import { TrackResDto } from 'src/modules/track/dto';

export class OutputUserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  realName: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  position: string;

  @Expose()
  github: string;

  @Expose()
  role: string;

  @Expose()
  status: number;

  @Expose()
  track: TrackResDto;
}
