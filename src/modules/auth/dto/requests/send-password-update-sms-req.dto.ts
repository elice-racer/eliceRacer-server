import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendPasswordUpdateSmsReqDto {
  @ApiProperty({
    description: '등록되어 있는 핸드폰번호',
    example: '01012345678',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: '아이디 또는 이메일',
    example: 'test@test.com or ID',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;
}
