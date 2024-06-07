import { ApiProperty } from '@nestjs/swagger';

export class PaginationRacersByCardinalDto {
  @ApiProperty({
    description: '페이지당 항목 수',
    example: '10',
    required: true,
  })
  pageSize: string;

  @ApiProperty({
    description: '트랙 이름',
    example: 'AI',
    required: true,
  })
  trackName: string;

  @ApiProperty({
    description: '트랙 기수',
    example: '1',
    required: true,
  })
  cardinalNo: string;

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
