import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class PaginationTeamsByProjectDto {
  @ApiProperty({
    description: '프로젝트 id',
    example: 'project-uuid',
    required: true,
  })
  @IsUUID('4', { message: 'projectId는 UUID 형식이어야 합니다.' })
  projectId: string;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: '10',
    required: true,
  })
  @Transform(({ value }) => parseInt(value))
  pageSize: number;

  @ApiProperty({
    description: ' 페이징을 시작할 마지막 팀 번호 (있는 경우)',
    example: '1',
    required: false,
  })
  @Transform(({ value }) => parseInt(value))
  lastTeamNumber?: string;
}
