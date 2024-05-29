import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateTeamReqDto {
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @IsInt()
  @IsNotEmpty()
  teamNumber: number;

  @IsString()
  @IsNotEmpty()
  notion: string;
}
