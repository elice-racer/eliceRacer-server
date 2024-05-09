import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { User } from 'src/modules/user/entities';

export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const { ip, method, originalUrl } = request;

    const userAgent = request.headers['user-agent'] || '';
    const user = request.user as User;
    const userId = user?.id || 'Anonymous';

    // TODO 로깅 디렉터리 나중에는 S3로 옮길 것
    const start = Date.now();
    const logDirectory = './logs';

    if (!existsSync(logDirectory)) {
      mkdirSync(logDirectory, { recursive: true });
    }

    const accessLogPath = `${logDirectory}/access.log`;
    const errorLogPath = `${logDirectory}/error.log`;

    return next.handle().pipe(
      tap(() => {
        const elapsedTime = Date.now() - start;
        const logEntry = `${new Date().toISOString()} - ${ip} - ${userId} - ${method} ${originalUrl} - ${userAgent} - ${response.statusCode} - ${elapsedTime}ms\n`;
        try {
          appendFileSync(accessLogPath, logEntry);
        } catch (err) {
          this.logger.error(`Failed to write to access log: ${err.message}`);
        }

        this.logger.log(
          `Request logged: ${method} ${originalUrl} - ${response.statusCode} - ${elapsedTime}ms`,
        );
      }),
      catchError((error) => {
        const errorLogEntry = `${new Date().toISOString()} - ERROR - ${ip} - ${userId} - ${method} ${originalUrl} - ${userAgent} - Error Message: ${error.message}\n`;
        try {
          appendFileSync(errorLogPath, errorLogEntry);
        } catch (err) {
          this.logger.error(`Failed to write to error log: ${err.message}`);
        }
        this.logger.error(`Error - ${method} ${originalUrl}: ${error.message}`);
        return throwError(error);
      }),
    );
  }
}
