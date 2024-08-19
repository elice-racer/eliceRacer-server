import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyEamilReqDto {
  @ApiProperty({
    description: '이메일 인증시 사용자의 id값',
    example: 'user-uuid',
    required: true,
  })
  @IsUUID('4', { message: 'userId는 UUID 형식이어야 합니다.' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: '이메일 인증 토큰',
    example: '302c0f9f-9abb-4070-912f-ba41d366fa42',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
