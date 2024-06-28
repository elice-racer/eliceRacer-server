import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OutputTeamDto } from 'src/modules/team/dto';
import { Team } from 'src/modules/team/entities/team.entity';
import { OutputUserDto } from 'src/modules/user/dto';
import { User } from 'src/modules/user/entities';

export class CreateChatResDto {
  @ApiResponseProperty({
    // description: '채팅방 uuid 값',
    example: 'chat-uuid',
    type: 'string',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: '채팅방 이름',
    example: ' 00님과의 채팅방 ',
    type: 'string',
  })
  @Expose()
  chatName: string;

  @ApiProperty({
    description: '채팅방 이름',
    example: ' PERSONAL | GROUP | TEAM',
    type: 'enum',
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: '팀 채팅방에 소속된 팀',
    example: 'team 정보 ',
    type: Team,
  })
  @Expose()
  team: OutputTeamDto;

  @ApiProperty({
    description: '채팅방 참여 유저 정보',
    example: 'user 정보 ',
    type: User,
  })
  @Expose()
  users: OutputUserDto;
}
