import { Expose } from 'class-transformer';
import { TrackDto } from 'src/modules/track/dto';

export class CurrentResDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  role: string;

  @Expose()
  realName: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  position: string;

  @Expose()
  github: string;

  @Expose()
  profileImage: string;

  @Expose()
  track: TrackDto;
}
