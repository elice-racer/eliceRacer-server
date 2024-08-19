import { DetailUserResDto } from 'src/modules/user/dto';
import { ChatType } from '../../entities/chat.entity';

export class OutPutChatDto {
  id: string;

  chatName: string;

  type: ChatType;

  users: DetailUserResDto[];
}
