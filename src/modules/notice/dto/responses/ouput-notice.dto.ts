import { Expose } from 'class-transformer';
import { UserRole } from 'src/modules/user/entities';

export class AuthorDto {
  @Expose()
  id: string;

  @Expose()
  role: UserRole;

  @Expose()
  realName: string;
}

export class OutputNoticeDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  user: AuthorDto;
}
