import { Expose } from 'class-transformer';
import { DetailUserResDto } from './detail-user-res.dto';

export class UserWithPhoneResDto extends DetailUserResDto {
  @Expose()
  phoneNumber: string;
}
