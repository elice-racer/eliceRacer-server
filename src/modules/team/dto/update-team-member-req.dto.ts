import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class UserDto {
  @IsUUID()
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
