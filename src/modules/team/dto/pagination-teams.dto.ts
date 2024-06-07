import { ApiProperty } from '@nestjs/swagger';

export class PaginationTeamsDto {
  @ApiProperty({
    description: '페이지당 항목 수',
    example: '10',
    required: true,
  })
  pageSize: string;

  @ApiProperty({
    description: '페이징을 시작할 마지막 트랙 이름 (있는 경우)',
    example: 'AI',
    required: false,
  })
  lastTrackName?: string;

  @ApiProperty({
    description: '페이징을 시작할 마지막 트랙 기수 (있는 경우)',
    example: '1',
    required: false,
  })
  lastCardinalNo?: string;

  @ApiProperty({
    description: ' 페이징을 시작할 마지막 프로젝트 회차(있는 경우)',
    example: '1',
    required: false,
  })
  lastRound?: string;

  @ApiProperty({
    description: ' 페이징을 시작할 마지막 팀 번호 (있는 경우)',
    example: '1',
    required: false,
  })
  lastTeamNumber?: string;
}
