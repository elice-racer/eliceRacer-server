import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { PaginationProjectsByTrackDto, PaginationProjectsDto } from '../dto';
import { PaginationProjectsByCardinalDto } from '../dto/pagination-projects-by-carinal.dto';
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
  async getAllProejcts(@Query() dto: PaginationProjectsDto) {
    return await this.projectService.getAllProejcts(dto);
  }

  @Get('/tracks/all')
  @Serialize(OutputProjectDto)
  async getProjectsByTrack(@Query() dto: PaginationProjectsByTrackDto) {
    return await this.projectService.getProjectsByTrack(dto);
  }

  @Get('/cardinals/all')
  @Serialize(OutputProjectDto)
  async getProjectsByTrackAndCardinalNo(
    @Query()
    dto: PaginationProjectsByCardinalDto,
  ) {
    return this.projectService.getProjectsByTrackAndCardinalNo(dto);
  }

  @Get('/:projectId')
  @Serialize(OutputProjectDto)
  async getProject(@Param('projectId') projectId: string) {
    return this.projectService.getProject(projectId);
  }
}
