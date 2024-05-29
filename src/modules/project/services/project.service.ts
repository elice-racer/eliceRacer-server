import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../repositories/project.repository';
import { TrackRepository } from 'src/modules/track/repositories';
import { Project } from '../entities';
import { UpdateProjectReqDto } from '../dto';
import { BusinessException } from 'src/exception';

@Injectable()
export class ProjectService {
  constructor(
    private readonly ProejctRepo: ProjectRepository,
    private readonly tarckRepo: TrackRepository,
  ) {}

  async getProject() {}
  async getAllProejcts() {}
  async getProjectByTrack() {}

  async updateProject(
    projectId: string,
    dto: UpdateProjectReqDto,
  ): Promise<Project> {
    const project = await this.ProejctRepo.findOneBy({ id: projectId });
    if (!project)
      throw new BusinessException(
        `project`,
        `해당 프로젝트가 존재하지 않습니다.`,
        `해당 프로젝트가 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    project.projectName = dto.projectName;
    project.round = dto.round;
    project.startDate = new Date(dto.startDate);
    project.endDate = new Date(dto.endDate);
    return project;
  }

  async deleteProject() {}
}
