import { IsNotEmpty } from 'class-validator';

export class VerifyCodeReqDto {
  @IsNotEmpty()
  phoneNumber: string;
  @IsNotEmpty()
  realName: string;
  @IsNotEmpty()
  authCode: string;
}
