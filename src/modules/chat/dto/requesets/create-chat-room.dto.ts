import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateChatRoomDto {
  @ApiProperty({
    description: 'userId값들',
    example: `['userId1', 'userId2']`,
    required: true,
    type: 'string[]',
  })
  @IsNotEmpty({ each: true })
  @IsUUID('4', { each: true, message: '각 userId는 UUID 형식이어야 합니다.' })
  userIds: string[];

  @ApiProperty({
    description: '채팅방 이름',
    example: `00님과의 채팅방입니다`,
    required: true,
    type: 'string',
  })
  chatName: string;
}
