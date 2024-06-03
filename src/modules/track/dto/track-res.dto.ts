import { Expose } from 'class-transformer';

export class TrackResDto {
  @Expose()
  id: string;
  @Expose()
  trackName: string;
  @Expose()
  cardinalNo: number;
}
