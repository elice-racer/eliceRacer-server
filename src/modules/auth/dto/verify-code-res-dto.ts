import { Expose } from 'class-transformer';
import { TrackDto } from 'src/modules/track/dto';
import { UserRole } from 'src/modules/user/entities';

export class VerifyCodeResDto {
  @Expose()
  email: string | null;
  @Expose()
  realName: string;
  @Expose()
  role: UserRole;
  @Expose()
  track: TrackDto;
}
