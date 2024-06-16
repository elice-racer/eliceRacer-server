import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: '관리자 가입 이메일',
    example: 'test@elicer.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @Matches(/^[^@]+@elicer\.com$/, {
    message: '관리자 가입은 elicer.com 로만 허용됩니다',
  })
  email: string;

  @ApiProperty({ description: '실명', example: '임지은', required: true })
  @IsNotEmpty()
  @IsString()
  realName: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password1234',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: '비밀번호는 최소 8자 이상이어야 합니다.',
  })
  @MaxLength(24, { message: '비밀번호는 최대 24자 이하여야 합니다' })
  password: string;
}
