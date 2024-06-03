import { map } from 'rxjs/operators';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PaginationResponseDto, ResponseDto } from 'src/common/dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && data.pagination) {
          const { pagination, ...resultData } = data;
          return new PaginationResponseDto(
            HttpStatus.OK,
            'Success',
            pagination,
            resultData[Object.keys(resultData)[0]],
          );
        } else {
          return new ResponseDto(HttpStatus.OK, 'Success', data);
        }
      }),
    );
  }
}
