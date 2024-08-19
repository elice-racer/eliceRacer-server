import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateTeamReqDto {
  @ApiProperty({
    description: '팀 이름',
    example: 'team-name',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @ApiProperty({
    description: '팀 번호',
    example: 1,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  teamNumber: number;

  @ApiProperty({
    description: '팀 노션 주소',
    example: 'notion-url',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  notion: string;

  @ApiProperty({
    description: '팀 깃랩주소',
    example: 'gitlab-url',
    required: true,
  })
  @IsString()
  gitlab: string;
}
