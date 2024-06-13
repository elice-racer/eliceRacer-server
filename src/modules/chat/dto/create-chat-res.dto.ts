import { Expose } from 'class-transformer';
import { OutputTeamDto } from 'src/modules/team/dto';
import { OutputUserDto } from 'src/modules/user/dto';

export class CreateChatResDto {
  @Expose()
  id: string;

  @Expose()
  chatName: string;

  @Expose()
  team: OutputTeamDto;

  @Expose()
  users: OutputUserDto;
}
