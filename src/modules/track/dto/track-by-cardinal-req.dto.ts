import { ApiProperty } from '@nestjs/swagger';

export class TrackByCardinalReqDto {
  @ApiProperty({
    description: '트랙 이름',
    example: 'AI',
    required: true,
  })
  trackName: string;

  @ApiProperty({
    description: '트랙 기수',
    example: '1',
    required: true,
  })
  cardinalNo: string;
}
