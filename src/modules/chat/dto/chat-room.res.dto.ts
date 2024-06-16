import { Expose, Transform } from 'class-transformer';

export class ChatRoomResDto {
  @Expose()
  id: string;

  @Expose()
  chatName: string;

  @Expose()
  type: string;

  @Expose()
  @Transform(({ value }) => value.length)
  users: number;
}
