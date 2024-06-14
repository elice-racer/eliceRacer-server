import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PasswordResetReqDto {
  @ApiProperty({
    description: '등록되어있는 핸드폰번호',
  })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: '아이디 또는 이메일',
  })
  @IsNotEmpty()
  identifier: string;
}
