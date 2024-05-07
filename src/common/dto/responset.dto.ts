export class ResponseDto<T> {
  data: T;
  message: string;
  statusCode: number;

  constructor(code: number, message: string, data?: T) {
    this.message = message;
    this.statusCode = code;
    this.data = data;
  }
}
