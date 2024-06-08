import { HttpStatus } from '@nestjs/common';
import { genId, utcToKoreanTDate } from 'src/common/utils';

export type ErrorDomain =
  | 'validate'
  | 'generic'
  | 'auth'
  | 'user'
  | 'admin'
  | 'track'
  | 'member'
  | 'sms'
  | 'project'
  | 'team'
  | 'notice';

export class BusinessException extends Error {
  public readonly id: string;
  public readonly timestamp: Date;

  constructor(
    public readonly domain: ErrorDomain,
    public readonly message: string,
    public readonly apiMessage: string,
    public readonly status: HttpStatus,
  ) {
    super(message);
    this.id = genId();
    this.timestamp = utcToKoreanTDate(new Date());
  }
}
