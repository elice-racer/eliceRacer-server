import { IsNotEmpty, IsString } from 'class-validator';

export class LoginReqDto {
  @IsNotEmpty()
  @IsString({ message: '문자를 입력하세요' })
  identifier: string;

  @IsNotEmpty()
  @IsString({ message: '비번 문자를 입력하세요' })
  password: string;
}
