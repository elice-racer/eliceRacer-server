import { ArgumentMetadata, HttpStatus, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { BusinessException } from 'src/exception';

export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = this.formatErrors(errors);
      throw new BusinessException(
        `validate`,
        errorMessages,
        errorMessages,
        HttpStatus.BAD_REQUEST,
      );
    }

    return object;
  }

  private toValidate(metatype: new (...args: any[]) => any): boolean {
    const types: Array<new (...args: any[]) => any> = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !types.includes(metatype);
  }

  private formatErrors(validationErrors: ValidationError[]): string {
    const errorsArray: string[] = [];

    for (const error of validationErrors) {
      let errorsString: string = `${error.property}: `;

      for (const constraint in error.constraints) {
        if (!error.constraints.hasOwnProperty(constraint)) {
          continue;
        }

        errorsString += `${error.constraints[constraint]}. `;
      }

      errorsArray.push(errorsString);
    }

    return errorsArray.join(`\n`);
  }
}
