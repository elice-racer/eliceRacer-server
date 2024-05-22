import { TrackDto } from 'src/modules/track/dto';

export class VerifyCodeResDto {
  email: string | null;
  realName: string | null;
  track: TrackDto;
}
