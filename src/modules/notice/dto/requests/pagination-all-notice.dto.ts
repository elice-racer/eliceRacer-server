import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class PaginationNoticeDto {
  @ApiProperty({ description: '페이지 쪽수', example: 1, required: true })
  @Transform(({ value }) => parseInt(value))
  @IsNotEmpty()
  page: number;

  @ApiProperty({
    description: '페이지 항목개수',
    example: 10,
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  pageSize: number;

  @ApiProperty({ description: '작성자 id값', example: 'uuid', required: true })
  @IsNotEmpty()
  @IsUUID('4', { message: '각 userId는 UUID 형식이어야 합니다.' })
  userId?: string;
}
