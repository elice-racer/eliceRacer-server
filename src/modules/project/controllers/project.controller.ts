import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { PaginationAllProjectsDto } from '../dto';
import { JwtAuthGuard } from 'src/common/guards';
import { ResponseInterceptor, Serialize } from 'src/interceptors';
import { OutputProjectDto } from '../dto/output-project.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('project')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(ResponseInterceptor)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('all')
  @Serialize(OutputProjectDto)
  async getAllProejcts(@Query() dto: PaginationAllProjectsDto) {
    return await this.projectService.getAllProejcts(dto);
  }

  @Get('/:projectId')
  @Serialize(OutputProjectDto)
  async getProject(@Param('projectId') projectId: string) {
    return this.projectService.getProject(projectId);
  }
}
