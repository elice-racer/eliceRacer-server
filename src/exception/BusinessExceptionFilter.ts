import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BusinessException, ErrorDomain } from './BusinessException';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { User } from 'src/modules/user/entities';

export interface ApiError {
  id: string;
  domain: ErrorDomain;
  message: string;
  timestamp: Date;
}

@Catch(Error)
export class BusinessExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BusinessExceptionFilter.name);
  private readonly logDirectory = './logs';
  private readonly errorLogPath = `${this.logDirectory}/error.log`;
  constructor() {
    if (!existsSync(this.logDirectory)) {
      mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  catch(exception: Error, host: ArgumentsHost) {
    let body: ApiError;
    let status: HttpStatus;
    const stack: string =
      exception.stack || (Error.captureStackTrace(exception), exception.stack);

    if (exception instanceof BusinessException) {
      status = exception.status;
      body = {
        id: exception.id,
        domain: exception.domain,
        message: exception.apiMessage,
        timestamp: exception.timestamp,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      body = new BusinessException(
        'generic',
        exception.message,
        exception.message,
        exception.getStatus(),
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      body = new BusinessException(
        'generic',
        `Internal server error: ${exception.message}`,
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 에러 로깅
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const { ip, method, originalUrl } = request;

    const userAgent = request.headers['user-agent'] || '';
    const user = request.user as User;
    const userId = user?.id || 'Anonymous';
    const logMessage = `${new Date().toISOString()} [ERROR] ${method} ${originalUrl} Agent: ${userAgent} - IP: ${ip} - User: ${userId} - Error ID: ${body.id} - Message: ${exception.message} - Status: ${status} \n`;
    appendFileSync(this.errorLogPath, logMessage);
    this.logger.error(logMessage, stack);

    response.status(status).json(body);
  }
}
