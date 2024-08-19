import { IsNotEmpty } from 'class-validator';

export class RefreshReqDto {
  @IsNotEmpty()
  refreshToken: string;
}
