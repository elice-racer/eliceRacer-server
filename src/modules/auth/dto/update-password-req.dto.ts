import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class updatePasswordReqDto {
  @ApiProperty({
    description: 'userId',
    required: true,
  })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '등록되어있는 핸드폰번호',
    required: true,
  })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: '새로운 비밀번호',
    example: 'password1234',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: '비밀번호는 최소 8자 이상이어야 합니다.',
  })
  @MaxLength(20, { message: '비밀번호는 최대 24자 이하여야 합니다' })
  password: string;
}
