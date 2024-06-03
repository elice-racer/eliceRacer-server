import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';

interface ClassConstructor<T> {
  new (...args: any[]): T;
}

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

const options: ClassTransformOptions = {
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
};

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        if (data.pagination) {
          const { pagination, ...resultData } = data;
          const results = resultData[Object.keys(resultData)[0]];

          const serializedResults = results.map((item: any) =>
            plainToInstance(this.dto, item, options),
          );

          return {
            results: serializedResults,
            pagination,
          };
        } else {
          return plainToInstance(this.dto, data, options);
        }
      }),
    );
  }
}
