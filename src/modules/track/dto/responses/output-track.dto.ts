import { Expose } from 'class-transformer';

export class OutputTrackDto {
  @Expose()
  id: string;
  @Expose()
  trackName: string;
  @Expose()
  cardinalNo: number;
}
