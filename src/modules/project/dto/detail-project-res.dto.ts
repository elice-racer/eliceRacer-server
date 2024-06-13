import { Expose } from 'class-transformer';

export class DetailProjectResDto {
  @Expose()
  id: string;

  @Expose()
  projectName: string;

  @Expose()
  round: number;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;
}
