import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { PaginationProjectsByTrackDto } from '../dto';
import { PaginationProjectsByCardinalDto } from '../dto/pagination-projects-by-carinal.dto';
import { JwtAuthGuard } from 'src/common/guards';
import { ResponseInterceptor, Serialize } from 'src/interceptors';
import { OutputProjectDto } from '../dto/output-project.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('project')
@Controller('projects')
@UseInterceptors(ResponseInterceptor)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('/:projectId')
  @UseGuards(JwtAuthGuard)
  @Serialize(OutputProjectDto)
  async getProject(@Param('projectId') projectId: string) {
    return this.projectService.getProject(projectId);
  }

  @Get('/tracks/all')
  @UseGuards(JwtAuthGuard)
  @Serialize(OutputProjectDto)
  async getProjectsByTrack(@Query() dto: PaginationProjectsByTrackDto) {
    return await this.projectService.getProjectsByTrack(dto);
  }

  @Get('/cardinals/all')
  @UseGuards(JwtAuthGuard)
  @Serialize(OutputProjectDto)
  async getProjectsByTrackAndCardinalNo(
    @Query()
    dto: PaginationProjectsByCardinalDto,
  ) {
    return this.projectService.getProjectsByTrackAndCardinalNo(dto);
  }
}
