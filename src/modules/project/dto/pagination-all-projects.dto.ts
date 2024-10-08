import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationAllProjectsDto {
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
  @Transform(({ value }) => value.toUpperCase())
  trackName: string;

  @ApiProperty({
    description: '트랙 기수. 모든 기수 검색시 0',
    example: '1',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  cardinalNo: number;

  @ApiProperty({
    description: '프로젝트 회차. 모든 회차 검색시 0',
    example: '1',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  round: number;

  @ApiProperty({
    description: '페이징을 시작할 마지막 트랙이름 (있는 경우)',
    example: 'AI',
    required: false,
  })
  lastTrackName?: string;

  @ApiProperty({
    description: '페이징을 시작할 마지막 트랙 기수 (있는 경우)',
    example: '1',
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  lastCardinalNo?: number;

  @ApiProperty({
    description: '페이징을 시작할 마지막 프로젝트 회차 (있는 경우)',
    example: '1',
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  lastRound?: number;
}
