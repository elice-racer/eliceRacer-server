import { Expose } from 'class-transformer';
import { DetailProjectResDto } from 'src/modules/project/dto';

export class DetailTeamResDto {
  @Expose()
  teamName: string;

  @Expose()
  teamNumber: string;

  @Expose()
  project: DetailProjectResDto;
}
