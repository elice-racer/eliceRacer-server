import { ApiProperty } from '@nestjs/swagger';

export class PaginationNoticeDto {
  @ApiProperty({ description: '페이지 쪽수', example: '1', required: true })
  page: string;

  @ApiProperty({
    description: '페이지 항목개수',
    example: '10',
    required: true,
  })
  pageSize: string;
}
