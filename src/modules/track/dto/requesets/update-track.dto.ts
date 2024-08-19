import { IsString } from 'class-validator';

export class UpdateTrackDto {
  @IsString()
  trackName: string;
  cardinalNo: number;
}
