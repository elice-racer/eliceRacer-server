import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../repositories/project.repository';
import { TrackRepository } from 'src/modules/track/repositories';
import { Project } from '../entities';
import { PaginationAllProjectsDto, UpdateProjectReqDto } from '../dto';
import { BusinessException } from 'src/exception';

import { ConfigService } from '@nestjs/config';
import { ENV_SERVER_URL_KEY } from 'src/common/const';

@Injectable()
export class ProjectService {
  private baseUrl;
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly tarckRepo: TrackRepository,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>(ENV_SERVER_URL_KEY);
  }

  async getProject(projectId: string) {
    const project = this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['track'],
    });

    if (!project)
      throw new BusinessException(
        `project`,
        `해당 프로젝트가 존재하지 않습니다.`,
        `해당 프로젝트가 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    return project;
  }

  async getAllProejcts(dto: PaginationAllProjectsDto) {
    const { pageSize, trackName, cardinalNo, round } = dto;

    const projects = await this.projectRepo.findAllProjects(dto);

    let next: string | null = null;
    if (projects.length > pageSize) {
      const lastProject = projects[pageSize - 1];
      next = `${this.baseUrl}/api/projects/all?pageSize=${pageSize}&trackName=${trackName}&cardinalNo=${cardinalNo}&round=${round}&lastTrackName=${lastProject.track.trackName}&lastCardinalNo=${lastProject.track.cardinalNo}&lastRound=${lastProject.round}`;
      projects.pop();
    }
    return { projects, pagination: { next, count: projects.length } };
  }

  async updateProject(
    projectId: string,
    dto: UpdateProjectReqDto,
  ): Promise<Project> {
    const project = await this.projectRepo.findOneBy({ id: projectId });
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

    return this.projectRepo.save(project);
  }

  async deleteProject() {}
}
