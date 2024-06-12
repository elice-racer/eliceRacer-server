import { Controller, Get, Param } from '@nestjs/common';
import { OfficehourService } from '../services/officehour.service';

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
}
