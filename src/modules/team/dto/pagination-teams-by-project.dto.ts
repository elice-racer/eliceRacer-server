import { ApiProperty } from '@nestjs/swagger';

export class PaginationTeamsByProjectDto {
  @ApiProperty({
    description: '프로젝트 id',
    example: 'project-uuid',
    required: true,
  })
  projectId: string;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: '10',
    required: true,
  })
  pageSize: string;

  @ApiProperty({
    description: ' 페이징을 시작할 마지막 팀 번호 (있는 경우)',
    example: '1',
    required: false,
  })
  lastTeamNumber?: string;
}
