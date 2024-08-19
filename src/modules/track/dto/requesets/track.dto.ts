import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class TrackDto {
  @ApiProperty({
    description: '트랙 이름',
    example: 'AI',
    required: true,
  })
  @Transform(({ value }) => value.toUpperCase())
  @IsNotEmpty()
  @Expose()
  trackName: string;

  @ApiProperty({
    description: '트랙 기수',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @Expose()
  cardinalNo: number;
}
