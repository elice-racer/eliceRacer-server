import { Expose, Type } from 'class-transformer';
import { DetailProjectResDto } from 'src/modules/project/dto';
import { OutputUserDto } from 'src/modules/user/dto';
import { OutputTeamDto } from './output-team.dto';

class ChatDto {
  @Expose()
  id: string;
}
export class DetailTeamResDto extends OutputTeamDto {
  @Expose()
  chat: ChatDto;

  @Expose()
  project: DetailProjectResDto;

  @Expose()
  @Type(() => OutputUserDto)
  users: OutputUserDto;
}
