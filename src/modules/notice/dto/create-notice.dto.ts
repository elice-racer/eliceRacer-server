import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoticeDto {
  @ApiProperty({
    description: '글 제목',
    example: '[AI8] 1팀 오피스아워 시간 변경',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: '글 내용',
    example:
      '코치님의 사정으로 인하여 오피스아워 시간이 변경되었음을 알려드립니다',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
