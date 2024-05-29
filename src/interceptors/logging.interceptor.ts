import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { Observable, tap } from 'rxjs';
import { utcToKoreanTDate } from 'src/common/utils';
import { User } from 'src/modules/user/entities';

export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    //로그 directory
    const logDirectory = './logs';
    if (!existsSync(logDirectory)) {
      mkdirSync(logDirectory, { recursive: true });
    }
    const accessLogPath = `${logDirectory}/access.log`;

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const { ip, method, originalUrl } = request;

    if (originalUrl.includes('/api/health')) {
      return next.handle(); // 로그를 생성하지 않고 요청을 그대로 진행
    }
    const userAgent = request.headers['user-agent'] || '';
    const user = request.user as User;
    const userId = user?.id || 'Anonymous';

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsedTime = Date.now() - start;
        const logMessage = `${utcToKoreanTDate(new Date()).toISOString()} ${method} ${originalUrl} Agent: ${userAgent} - IP: ${ip} - User: ${userId} - Status: ${response.statusCode} - ${elapsedTime}ms \n`;

        try {
          appendFileSync(accessLogPath, logMessage);
          this.logger.log(logMessage);
        } catch (err) {
          this.logger.error(`Failed to write to access log: ${err.message}`);
        }
      }),
    );
  }
}
