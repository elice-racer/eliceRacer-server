import { TrackDto } from 'src/modules/track/dto';

export type VerifyCodeResDto = {
  email: string | null;
  realName: string | null;
  track: TrackDto[];
};
