import { Expose } from 'class-transformer';

export class OutputTeamDto {
  @Expose()
  id: string;

  @Expose()
  teamName: string;

  @Expose()
  teamNumber: number;

  @Expose()
  notion: string;
}
