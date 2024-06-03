import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../repositories/project.repository';
import { TrackRepository } from 'src/modules/track/repositories';
import { Project } from '../entities';
import {
  PaginationProjectsByTrackDto,
  PaginationProjectsDto,
  UpdateProjectReqDto,
} from '../dto';
import { BusinessException } from 'src/exception';
import { PaginationProjectsByCardinalDto } from '../dto/pagination-projects-by-carinal.dto';
import { ConfigService } from '@nestjs/config';
import { ENV_BASE_URL_KEY } from 'src/common/const';

@Injectable()
export class ProjectService {
  private baseUrl;
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly tarckRepo: TrackRepository,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>(ENV_BASE_URL_KEY);
  }

  async getProject(projectId: string) {
    const project = this.projectRepo.findOneBy({ id: projectId });

    if (!project)
      throw new BusinessException(
        `project`,
        `해당 프로젝트가 존재하지 않습니다.`,
        `해당 프로젝트가 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    return project;
  }

  async getAllProejcts(dto: PaginationProjectsDto) {
    const { pageSize } = dto;

    const projects = await this.projectRepo.findAllProjects(dto);

    let next: string | null = null;
    if (projects.length > parseInt(pageSize)) {
      const lastProject = projects[parseInt(pageSize) - 1];
      next = `${this.baseUrl}/api/projects/all?pageSize=${pageSize}&lastTrackName=${lastProject.track.trackName}&lastCardinalNo=${lastProject.track.cardinalNo}&lastRound=${lastProject.round}`;
      projects.pop();
    }
    return { projects, pagination: { next, count: projects.length } };
  }

  async getProjectsByTrack(dto: PaginationProjectsByTrackDto) {
    const { trackName, pageSize } = dto;

    const pageSizeToInt = parseInt(pageSize);

    const track = await this.tarckRepo.findOne({ where: { trackName } });

    if (!track)
      throw new BusinessException(
        `project`,
        `해당 트랙(${trackName})이 존재하지 않습니다.`,
        `해당 트랙(${trackName})이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    const projects = await this.projectRepo.findProjectsByTrack(dto);

    let next: string | null = null;
    if (projects.length > pageSizeToInt) {
      const lastProject = projects[pageSizeToInt - 1];
      next = `${this.baseUrl}/api/projects/tracks/all?pageSize=${pageSize}&trackName=${trackName}&lastCardinalNo=${lastProject.track.cardinalNo}&lastRound=${lastProject.round}`;
      projects.pop();
    }

    return { projects, pagination: { next, count: projects.length } };
  }
  async getProjectsByTrackAndCardinalNo(dto: PaginationProjectsByCardinalDto) {
    const { trackName, cardinalNo, pageSize } = dto;

    const track = await this.tarckRepo.findOne({
      where: { trackName, cardinalNo: parseInt(cardinalNo) },
    });

    if (!track)
      throw new BusinessException(
        `project`,
        `해당 트랙(${trackName}${cardinalNo})이 존재하지 않습니다.`,
        `해당 트랙(${trackName}${cardinalNo})이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    const projects =
      await this.projectRepo.findProjectsByTrackAndCardinalNo(dto);

    let next: string | null = null;
    if (projects.length > parseInt(pageSize)) {
      const lastProject = projects[parseInt(pageSize) - 1];
      next = `${this.baseUrl}/api/projects/tracks-cardinal/all?pageSize=${pageSize}&trackName=${trackName}&cardinalNo=${lastProject.track.cardinalNo}&lastRound=${lastProject.round}`;
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
