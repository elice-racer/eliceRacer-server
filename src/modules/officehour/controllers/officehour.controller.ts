import { Controller, Get, Param } from '@nestjs/common';
import { OfficehourService } from '../services/officehour.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('officehour')
@Controller('officehours')
export class OfficehourController {
  constructor(private readonly officehourService: OfficehourService) {}

  @Get('/projects/:projectId')
  async getOfficehourByProject(@Param('projectId') projectId: string) {
    return await this.officehourService.getOfficehourByProject(projectId);
  }

  @Get('/teams/:teamId')
  async getOfficehourByTeam(@Param('teamId') teamId: string) {
    return await this.officehourService.getOfficehourByTeam(teamId);
  }

  //TODO officehour id로 가져오기
}
