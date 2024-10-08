import { Expose } from 'class-transformer';
import { IsUrl } from 'class-validator';
import { UserRole } from '../../entities';

export class OutputUserDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  realName: string;

  @Expose()
  comment: string;

  @Expose()
  position: string;

  @Expose()
  github: string;

  @Expose()
  blog: string;

  @Expose()
  sns: string;

  @Expose()
  description: string;

  @Expose()
  tmi: string;

  @Expose()
  @IsUrl()
  profileImage: string;

  @Expose()
  role: UserRole;

  @Expose()
  status: number;
}
