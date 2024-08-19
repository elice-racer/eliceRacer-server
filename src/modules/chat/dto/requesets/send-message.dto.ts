import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: '채팅방 id값', example: 'uuid', required: true })
  @IsUUID('4', { message: '각 chatId는 UUID 형식이어야 합니다.' })
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({ description: '채팅방 id값', example: 'uuid', required: true })
  @IsUUID('4', { message: '각 chatId는 UUID 형식이어야 합니다.' })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '채팅 내용',
    example: '채팅 내용 입니다',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500, { message: '최대 500자까지 입력 가능합니다' })
  content: string;
}
