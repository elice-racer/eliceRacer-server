import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class PaginationMessagesDto {
  @ApiProperty({ description: '채팅방 id값', example: 'uuid', required: true })
  @IsUUID('4', { message: '각 chatId는 UUID 형식이어야 합니다.' })
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({
    description: '한 번 가져올 채팅의 개수',
    example: 50,
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNotEmpty()
  pageSize: number;

  @ApiProperty({
    description: '페이징을 시작할 마지막 메시지 id',
    example: 'uuid',
    required: false,
  })
  @IsUUID('4', {
    message: 'messageId는 UUID 형식이어야 합니다.',
  })
  lastMessageId?: string;

  @ApiProperty({
    description: '페이징을 시작할 마지막 작성일자',
    example: '2024-01-01',
    required: false,
  })
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  lastMessageCreatedAt?: Date;
}
