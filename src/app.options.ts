import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { NestApplicationOptions } from '@nestjs/common';

export function getNestOptions(): NestApplicationOptions {
  return {
    abortOnError: true,
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('elicerRacer', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
  };
}
