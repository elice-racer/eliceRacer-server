import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationNoticeDto {
  @ApiProperty({ description: '페이지 쪽수', example: 1, required: true })
  @Transform(({ value }) => parseInt(value))
  page: number;

  @ApiProperty({
    description: '페이지 항목개수',
    example: 10,
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  pageSize: number;
}
