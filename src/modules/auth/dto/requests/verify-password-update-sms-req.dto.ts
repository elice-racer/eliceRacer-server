import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPasswordUpdateSmsReqDto {
  @ApiProperty({
    description: '등록되어있는 핸드폰번호',
    example: '01012345678',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: '인증번호',
    example: '123456',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  authCode: string;
}
