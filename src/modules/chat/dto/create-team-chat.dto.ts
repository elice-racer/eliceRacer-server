import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateTeamChatDto {
  @ApiProperty({ description: '팀 id값 ' })
  @IsUUID()
  teamId: string;
}
