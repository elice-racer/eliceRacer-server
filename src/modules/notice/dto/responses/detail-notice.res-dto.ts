import { Expose } from 'class-transformer';
import { OutputNoticeDto } from './ouput-notice.dto';

export class DetailNoticeResDto extends OutputNoticeDto {
  @Expose()
  content: string;
}
