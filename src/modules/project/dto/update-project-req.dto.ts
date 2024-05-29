import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateProjectReqDto {
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsNumber()
  @IsNotEmpty()
  round: number;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;
}
