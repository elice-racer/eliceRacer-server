import { Expose } from 'class-transformer';
import { MessageUserDto } from 'src/modules/user/dto';

export class MessageResDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  user: MessageUserDto;

  @Expose()
  createdAt: Date;
}
