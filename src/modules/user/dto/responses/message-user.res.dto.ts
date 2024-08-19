import { TrackResDto } from 'src/modules/track/dto';
import { Expose } from 'class-transformer';
import { UserRole } from '../../entities';

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
  profileImage: string;
}
