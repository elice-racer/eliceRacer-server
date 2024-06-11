import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '새 사용자의 로그인 아이디',
    example: 'loginId',
    required: true,
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '새 사용자의 비밀번호',
    example: 'securePassword123',
    required: true,
  })
  @MinLength(8, {
    message: '비밀번호는 최소 8자 이상이어야 합니다.',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '새 사용자의 실제 이름',
    example: 'John Doe',
    required: true,
  })
  realName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '새 사용자의 전화번호',
    example: '01012345678',
    required: true,
  })
  phoneNumber: string;
}
