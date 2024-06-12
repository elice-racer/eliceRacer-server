import { TrackResDto } from 'src/modules/track/dto';
import { UserRole } from '../entities';
import { Expose } from 'class-transformer';

export class MessageUserDto {
  @Expose()
  id: string;

  @Expose()
  realName: string;

  @Expose()
  track: TrackResDto;

  @Expose()
  role: UserRole;

  @Expose()
  profileImage: null;
}
