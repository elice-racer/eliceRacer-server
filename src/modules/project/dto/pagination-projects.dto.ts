import { ApiProperty } from '@nestjs/swagger';

export class PaginationProjectsDto {
  @ApiProperty({
    description: '페이지당 항목 수',
    example: '10',
    required: true,
  })
  pageSize: string;
  lastTrackName?: string;
  lastCardinalNo?: string;
  lastRound?: string;
}
