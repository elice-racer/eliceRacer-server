import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationAllUsersDto {
  @ApiProperty({
    description: '페이지당 항목 수',
    example: '10',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  pageSize: number;

  @ApiProperty({
    description: '가져올 유저의 트랙',
    example: 'all | ai | sw | cloud ',
    required: true,
  })
  @Transform(({ value }) => value.toUpperCase())
  trackName: string;

  @ApiProperty({
    description: '가져올 유저의 트랙 기수',
    example: '1',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  cardinalNo: number;

  @ApiProperty({
    description: '가져올 유저의 역할',
    example: 'all | racer | coach | admin',
    required: true,
  })
  @Transform(({ value }) => value.toUpperCase())
  role: string;

  @ApiProperty({
    description: '페이징을 시작할 트랙이름 (있는 경우)',
    example: 'all | ai | sw | cloud ',
    required: false,
  })
  @Transform(({ value }) => value.toUpperCase())
  lastTrackName?: string;

  @ApiProperty({
    description: '페이징을 시작할 트랙 기수 (있는 경우)',
    example: '1',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  lastCardinalNo?: string;

  @ApiProperty({
    description: '페이징을 시작할 마지막 실제 이름 (있는 경우)',
    example: 'hamster',
    required: false,
  })
  lastRealName?: string;

  @ApiProperty({
    description: '페이징을 시작할 마지막 ID (있는 경우)',
    example: 'uuid-1234',
    required: false,
  })
  lastId?: string;
}
