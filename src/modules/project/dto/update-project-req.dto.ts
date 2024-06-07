import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateProjectReqDto {
  @ApiProperty({
    description: '프로젝트 이름',
    example: '최종프로젝트',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @ApiProperty({
    description: '프로젝트 회차',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  round: number;

  @ApiProperty({
    description: '프로젝트 시작일',
    example: '2024-01-01',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: '프로젝트 종료일',
    example: '2024-02-02',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  endDate: string;
}
