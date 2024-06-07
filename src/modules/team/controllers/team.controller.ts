import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { TeamService } from '../services/team.service';
import {
  OutputTeamDto,
  PaginationTeamsByCardinalDto,
  PaginationTeamsByProjectDto,
  PaginationTeamsByTrackDto,
  PaginationTeamsDto,
  UpdateTeamMemberReqDto,
  UpdateTeamReqDto,
} from '../dto';
import { ResponseInterceptor, Serialize } from 'src/interceptors';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('team')
@Controller('teams')
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

  @Get('/tracks-cardinal/all')
  @Serialize(OutputTeamDto)
  async getTeamsByCardinalNo(@Query() dto: PaginationTeamsByCardinalDto) {
    return await this.teamService.getTeamsByCardinalNo(dto);
  }

  @Get('/projects/all')
  @Serialize(OutputTeamDto)
  async getTeamsByProjects(@Query() dto: PaginationTeamsByProjectDto) {
    return await this.teamService.getTeamsByProject(dto);
  }

  @Get('/:id')
  @Serialize(OutputTeamDto)
  async getTeam(@Param('id') id: string) {
    return await this.teamService.getTeam(id);
  }

  @Patch('/:id')
  @Serialize(OutputTeamDto)
  async updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamReqDto) {
    return await this.teamService.updateTeam(id, dto);
  }

  @Patch('/:id')
  @Serialize(OutputTeamDto)
  async updateTeamMember(
    @Param('id') id: string,
    @Body() dto: UpdateTeamMemberReqDto,
  ) {
    return await this.teamService.updateTeamMember(id, dto);
  }

  @Delete('/:id')
  async deleteTeam(@Param('id') id: string) {
    await this.teamService.deleteTeam(id);
  }
}
