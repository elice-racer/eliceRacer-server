import { IsNotEmpty, IsString } from 'class-validator';
export class LoginReqDto {
  @IsNotEmpty({ message: '아이디 또는 이메일을 입력하세요' })
  @IsString({ message: '문자를 입력하세요' })
  identifier: string;

  @IsNotEmpty({ message: '비밀번호를 입력하세요' })
  @IsString({ message: '문자를 입력하세요' })
  password: string;
}
