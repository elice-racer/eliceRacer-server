import { ApiProperty } from '@nestjs/swagger';

export class PaginationTrackByNameDto {
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
    description: '페이징을 시작할 마지막 트랙 기수 (있는 경우)',
    example: '1',
    required: false,
  })
  lastCardinalNo?: string;
}
