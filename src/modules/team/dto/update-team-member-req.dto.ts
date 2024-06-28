import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class UserDto {
  @IsUUID('4', { message: '각 userId는 UUID 형식이어야 합니다.' })
  id: string;

  @IsNotEmpty()
  @IsString()
  realName: string;
}

export class UpdateTeamMemberReqDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  users: UserDto[];
}
