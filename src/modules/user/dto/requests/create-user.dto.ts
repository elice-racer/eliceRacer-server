import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: '새 사용자의 로그인 아이디',
    example: 'loginId',
    required: true,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '새 사용자의 비밀번호',
    example: 'securePassword123',
    required: true,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: '비밀번호는 최소 8자 이상이어야 합니다.',
  })
  @MaxLength(20, { message: '비밀번호는 최대 24자 이하여야 합니다' })
  password: string;

  @ApiProperty({
    description: '새 사용자의 실제 이름',
    example: 'John Doe',
    required: true,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  realName: string;

  @ApiProperty({
    description: '새 사용자의 전화번호',
    example: '01012345678',
    required: true,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
