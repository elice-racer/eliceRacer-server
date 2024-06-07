import { Expose } from 'class-transformer';

export class DetailProjectResDto {
  @Expose()
  projectName: string;

  @Expose()
  round: number;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;
}
