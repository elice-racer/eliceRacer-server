import { Expose } from 'class-transformer';

export class AuthorDto {
  @Expose()
  id: string;

  @Expose()
  realName: string;
}

export class OutputNoticeDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  user: AuthorDto;
}
