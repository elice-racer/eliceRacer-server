import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TeamService } from '../services/team.service';
import {
  OutputTeamDto,
  PaginationTeamsByCardinalDto,
  PaginationTeamsByProjectDto,
  PaginationTeamsByTrackDto,
  PaginationTeamsDto,
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
  async getAllTeams(@Query() dto: PaginationTeamsDto) {
    return await this.teamService.getAllTeams(dto);
  }

  @Get('/tracks/all')
  @Serialize(OutputTeamDto)
  async getTeamsByTrack(@Query() dto: PaginationTeamsByTrackDto) {
    return await this.teamService.getTeamsByTrack(dto);
  }

  @Get('/cardinals/all')
  @Serialize(OutputTeamDto)
  async getTeamsByCardinalNo(@Query() dto: PaginationTeamsByCardinalDto) {
    return await this.teamService.getTeamsByCardinalNo(dto);
  }

  @Get('/projects/all')
  @Serialize(OutputTeamDto)
  async getTeamsByProjects(@Query() dto: PaginationTeamsByProjectDto) {
    return await this.teamService.getTeamsByProject(dto);
  }

  @Get('/:teamId')
  @Serialize(OutputTeamDto)
  async getTeam(@Param('teamId') teamId: string) {
    return await this.teamService.getTeam(teamId);
  }

  @Patch('/:teamId')
  @Serialize(OutputTeamDto)
  async updateTeam(
    @CurrentUser() user: User,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamReqDto,
  ) {
    return await this.teamService.updateTeam(teamId, dto, user);
  }
}
