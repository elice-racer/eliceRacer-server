import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyPasswordResetReqDto {
  @ApiProperty({
    description: '등록되어있는 핸드폰번호',
  })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: '인증번호',
    example: '123456',
    required: true,
  })
  @IsNotEmpty()
  authCode: string;
}
