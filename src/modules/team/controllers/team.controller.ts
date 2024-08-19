import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TeamService } from '../services/team.service';
import {
  DetailTeamResDto,
  OutputTeamDto,
  PaginationAllTeamsDto,
  UpdateTeamReqDto,
} from '../dto';
import { ResponseInterceptor, Serialize } from 'src/interceptors';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/modules/user/entities';

@ApiTags('team')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(ResponseInterceptor)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('/all')
  @Serialize(OutputTeamDto)
  async getAllTeams(@Query() dto: PaginationAllTeamsDto) {
    return await this.teamService.getAllTeams(dto);
  }

  @Get('/:teamId')
  @Serialize(DetailTeamResDto)
  async getTeam(@Param('teamId') teamId: string) {
    return await this.teamService.getTeam(teamId);
  }

  //TODO 동시성제어
  //PATCH 에서 PUT으로 바꿈
  //TODO 팀 이름, 깃랩, 노션 수정 별개로 할 수 있게 하기.
  //TODO 그리고 team Number 수정하는거 빼기
  //TODO 어떻게 업데이트 할지 정하기
  @Put('/:teamId')
  @Serialize(OutputTeamDto)
  async updateTeam(
    @CurrentUser() user: User,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamReqDto,
  ) {
    return await this.teamService.updateTeam(teamId, dto, user);
  }
}
