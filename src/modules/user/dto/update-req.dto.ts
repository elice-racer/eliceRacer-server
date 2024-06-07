import { ApiProperty } from '@nestjs/swagger';

export class updateReqDto {
  @ApiProperty({
    description: '사용자의 실제 이름',
    example: 'Jane Doe',
    required: true,
  })
  realName: string;

  @ApiProperty({
    description: '사용자의 분야 직책',
    example: 'backend developer',
    required: true,
  })
  position: string;

  @ApiProperty({
    description: '사용자의 GitHub 주소',
    example: 'github.com/1234',
    required: true,
  })
  github: string;

  @ApiProperty({
    description: '사용자의 한 줄 소개',
    example: '백엔드 개발자 000입니다.',
    required: true,
  })
  comment: string;

  @ApiProperty({
    description: '사용자의 간략한 소개',
    example:
      '안녕하세요 저는 굉스터입니다. 제는 아무것도 안해도 능력치가 알아서 오르는 개발자가 되고싶습니다. 커비처럼 잡아먹고 그냥 능력을 뺏어오고 싶어요',
    required: true,
  })
  description: string;

  @ApiProperty({
    description: '사용자의 Blog 주소',
    example: 'velog.com/1234',
    required: true,
  })
  blog: string;

  @ApiProperty({
    description: '사용자의 sns 주소',
    example: 'linkedin.com/1234',
    required: true,
  })
  sns: string;

  @ApiProperty({
    description: '사용자의 tmi',
    example: '하루에 커피 4잔 마셔요',
    required: true,
  })
  tmi: string;
}
