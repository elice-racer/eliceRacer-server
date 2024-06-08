import { Expose } from 'class-transformer';
import { DetailProjectResDto } from 'src/modules/project/dto';

export class DetailTeamResDto {
  @Expose()
  id: string;

  @Expose()
  teamName: string;

  @Expose()
  teamNumber: string;

  @Expose()
  notion: string;

  @Expose()
  gitlab: string;

  @Expose()
  project: DetailProjectResDto;
}
