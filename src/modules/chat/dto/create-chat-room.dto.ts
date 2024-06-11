import { ApiProperty } from '@nestjs/swagger';

export class CreateChatRoomDto {
  @ApiProperty({
    description: 'userId값들',
  })
  userIds: string[];

  @ApiProperty({
    description: '채팅방이름',
  })
  chatName: string;
}
