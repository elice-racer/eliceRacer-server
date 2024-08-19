import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ChatRoomsReqDto {
  @ApiProperty({
    description: '트랙 이름',
    example: 'AI',
    required: true,
  })
  @Transform(({ value }) => value.toUpperCase())
  @IsNotEmpty()
  trackName: string;

  @ApiProperty({
    description: '트랙 기수. 모든 기수 검색시 0',
    example: 1,
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNotEmpty()
  cardinalNo: number;

  @ApiProperty({
    description: '프로젝트 회차. 모든 회차 검색시 0',
    example: '1',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  round: number;

  @ApiProperty({
    description: '채팅방 타입',
    example: 'all | team | group | personal',
    required: true,
  })
  @Transform(({ value }) => value.toUpperCase())
  type: string;
}
