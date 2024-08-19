import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyCodeReqDto {
  @ApiProperty({
    description: '핸드폰번호',
    example: '01012345678',
    required: true,
  })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: '실명',
    example: '이혜빈',
    required: true,
  })
  @IsNotEmpty()
  realName: string;

  @ApiProperty({
    description: '인증번호',
    example: '123456',
    required: true,
  })
  @IsNotEmpty()
  authCode: string;
}
