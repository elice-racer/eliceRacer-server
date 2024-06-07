import { Expose } from 'class-transformer';
import { OutputUserDto } from './output-user.dto';

export class DetailUserResDto extends OutputUserDto {
  @Expose()
  phoneNumber: string;
}
