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

  @Get('')
  @Serialize(OutputProjectDto)
  async getProejcts(@Query() dto: PaginationAllProjectsDto) {
    return await this.projectService.getProejcts(dto);
  }

  @Get('/:projectId')
  @Serialize(OutputProjectDto)
  async getProjectByProjectId(@Param('projectId') projectId: string) {
    return this.projectService.getProjectByProjectId(projectId);
  }
}
