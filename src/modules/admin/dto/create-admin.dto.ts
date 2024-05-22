import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsEmail()
  // @Matches(/^[^@]+@elicer.com\.com$/, {
  //   message: '관리자 가입은 elicer.com 로만 허용됩니다',
  // })
  email: string;

  @IsNotEmpty()
  @IsString()
  realName: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
