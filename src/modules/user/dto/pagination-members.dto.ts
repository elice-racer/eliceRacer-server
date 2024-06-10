import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationMembersDto {
  @ApiProperty({
    description: '페이지당 항목 수',
    example: '10',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  pageSize: number;

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
