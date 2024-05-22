import { HttpStatus } from '@nestjs/common';
import { genId } from 'src/common/utils/id-generator';

export type ErrorDomain =
  | 'validate'
  | 'generic'
  | 'auth'
  | 'user'
  | 'admin'
  | 'track'
  | 'member'
  | 'sms'
  | 'project';

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
    this.timestamp = new Date();
  }
}
