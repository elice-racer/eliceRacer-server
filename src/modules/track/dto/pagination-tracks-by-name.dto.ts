import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationTrackByNameDto {
  @ApiProperty({
    description: '페이지당 항목 수',
    example: '10',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  pageSize: number;

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
  @Transform(({ value }) => parseInt(value))
  lastCardinalNo?: number;
}
