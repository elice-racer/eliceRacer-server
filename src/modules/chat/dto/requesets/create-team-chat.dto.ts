import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateTeamChatDto {
  @ApiProperty({
    description: '팀 id값 ',
    example: 'team-uuid',
    required: true,
    type: 'string',
  })
  @IsUUID('4', { message: 'teamId는 UUID 형식이어야 합니다.' })
  teamId: string;
}
