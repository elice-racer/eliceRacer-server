import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { ChatType } from '../../entities/chat.entity';

export class ChatRoomResDto {
  @ApiProperty({
    description: '채팅방 uuid 값',
    example: 'chat-uuid',
    type: 'string',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: '채팅방 이름',
    example: ' 00님과의 채팅방 ',
    type: 'string',
  })
  @Expose()
  chatName: string;

  @ApiProperty({
    description: '채팅방 이름',
    example: ' PERSONAL | GROUP | TEAM',
    type: 'enum',
  })
  @Expose()
  type: ChatType;

  @ApiProperty({
    description: '채팅방 참여인원',
    example: 3,
    type: 'number',
  })
  @Expose()
  @Transform(({ value }) => console.log(value))
  usersCount: number;
}
