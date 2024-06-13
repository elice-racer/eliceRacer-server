import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
export class LoginReqDto {
  @ApiProperty({
    description: '아이디 또는 이메일',
    example: 'test@test.com 또는 id',
    required: true,
  })
  @IsNotEmpty({ message: '아이디 또는 이메일을 입력하세요' })
  @IsString({ message: '문자를 입력하세요' })
  identifier: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password1234',
    required: true,
  })
  @IsNotEmpty({ message: '비밀번호를 입력하세요' })
  @IsString({ message: '문자를 입력하세요' })
  @MinLength(8, { message: '최소 8자 이상 입력해주세요' })
  @MaxLength(24, { message: '최대 24자까지 가능합니다' })
  password: string;
}
