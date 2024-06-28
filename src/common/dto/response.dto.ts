import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({
    description: '응답 메시지',
    example: 'insert success',
    type: () => ResponseDto['data'],
  })
  data: T;

  @ApiProperty({
    description: '응답 메시지',
    example: 'success',
    type: 'string',
  })
  message: string;

  @ApiProperty({
    description: 'status code',
    example: 200,
    type: 'number',
  })
  statusCode: number;

  constructor(code: number, message: string, data?: T) {
    this.message = message;
    this.statusCode = code;
    this.data = data;
  }
}
