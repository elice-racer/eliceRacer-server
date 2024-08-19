import { Expose } from 'class-transformer';

export class OutputTeamDto {
  @Expose()
  id: string;

  @Expose()
  teamName: string;

  @Expose()
  teamNumber: number;

  @Expose()
  gitlab: string;

  @Expose()
  notion: string;
}
