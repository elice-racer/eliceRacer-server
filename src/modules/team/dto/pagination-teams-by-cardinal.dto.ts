import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationTeamsByCardinalDto {
  @ApiProperty({
    description: '페이지당 항목 수',
    example: '10',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  pageSize: number;

  @ApiProperty({
    description: '트랙 이름 ',
    example: 'AI',
    required: true,
  })
  trackName: string;

  @ApiProperty({
    description: '트랙 기수',
    example: '1',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  cardinalNo: number;

  @ApiProperty({
    description: '페이징을 시작할 마지막 프로젝트 회차 (있는 경우)',
    example: '1',
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  lastRound?: string;

  @ApiProperty({
    description: ' 페이징을 시작할 마지막 팀 번호 (있는 경우)',
    example: '1',
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  lastTeamNumber?: string;
}
