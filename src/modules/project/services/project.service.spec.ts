import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from '../repositories/project.repository';

import { TrackRepository } from 'src/modules/track/repositories';
import {
  PaginationProjectsByTrackDto,
  PaginationProjectsDto,
  UpdateProjectReqDto,
} from '../dto';
import { BusinessException } from 'src/exception';
import { Project } from '../entities';
import { PaginationProjectsByCardinalDto } from '../dto/pagination-projects-by-carinal.dto';
import { Track } from 'src/modules/track/entities';
import { ConfigService } from '@nestjs/config';

jest.unmock('./project.service');

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepo: jest.Mocked<ProjectRepository>;
  let trackRepo: jest.Mocked<TrackRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        ProjectRepository,
        TrackRepository,
        ConfigService,
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectRepo = module.get(ProjectRepository);
    trackRepo = module.get(TrackRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProject', () => {
    const projectId = 'uuid';

    it('프로젝트가 존재하지 않으면 BusinessException을 던진다', async () => {
      projectRepo.findOne.mockReturnValue(undefined);

      await expect(service.getProject(projectId)).rejects.toThrow(
        BusinessException,
      );
    });

    it('프로젝트가 존재하면 해당 프로젝트를 반환해준다', async () => {
      const project = new Project();

      projectRepo.findOne.mockResolvedValue(project);

      const result = await service.getProject(projectId);

      expect(result).toEqual(project);
    });
  });

  describe('getAllProjects', () => {
    const dto: PaginationProjectsDto = {
      pageSize: '10',
      lastTrackName: 'track-name',
      lastCardinalNo: 'cardinal-no',
      lastRound: 'last-round',
    };
    it('프로젝트가 존재하면 트랙,기수,회차 오름차순 정렬로 반환한다', async () => {
      const projects: Project[] = [{ projectName: 'project-name' } as Project];

      projectRepo.findAllProjects.mockResolvedValue(projects);

      const result = await service.getAllProejcts(dto);
      const expectedPagination = { next: null, count: 1 };

      expect(result.projects).toEqual(projects);
      expect(result.pagination).toEqual(expectedPagination);
    });
  });

  describe('getProjectsByTrack', () => {
    const dto: PaginationProjectsByTrackDto = {
      pageSize: '10',
      trackName: 'track-name',
      lastCardinalNo: '2',
      lastRound: '2',
    };
    it('트랙이 존재하지 않으면 BusinessException을 던진다', async () => {
      trackRepo.findOne.mockResolvedValue(undefined);

      await expect(service.getProjectsByTrack(dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('프로젝트가 존재하면 기수,회차 오름차순 정렬로 반환한다', async () => {
      const projects: Project[] = [{ projectName: 'project-name' } as Project];
      const track = new Track();

      trackRepo.findOne.mockResolvedValue(track);
      projectRepo.findProjectsByTrack.mockResolvedValue(projects);

      const result = await service.getProjectsByTrack(dto);
      const expectedPagination = { next: null, count: 1 };

      expect(result.projects).toEqual(projects);
      expect(result.pagination).toEqual(expectedPagination);
    });
  });

  describe('getProjectsByTrackAndCardinalNo', () => {
    const dto: PaginationProjectsByCardinalDto = {
      pageSize: '10',
      trackName: 'track-name',
      cardinalNo: '1',
      lastRound: '1',
    };
    it('트랙이 존재하지 않으면 BusinessException을 던진다', async () => {
      trackRepo.findOne.mockResolvedValue(undefined);

      await expect(
        service.getProjectsByTrackAndCardinalNo(dto),
      ).rejects.toThrow(BusinessException);
    });

    it('프로젝트가 존재하면 회차 오름차순 정렬로 반환한다', async () => {
      const projects: Project[] = [{ projectName: 'project-name' } as Project];
      const track = new Track();

      trackRepo.findOne.mockResolvedValue(track);
      projectRepo.findProjectsByTrackAndCardinalNo.mockResolvedValue(projects);

      const result = await service.getProjectsByTrackAndCardinalNo(dto);
      const expectedPagination = { next: null, count: 1 };

      expect(result.projects).toEqual(projects);
      expect(result.pagination).toEqual(expectedPagination);
    });
  });

  describe('updateProject', () => {
    const projectId = 'uuid';
    const dto: UpdateProjectReqDto = {
      projectName: 'update-project',
      round: 3,
      startDate: '2024-01-01',
      endDate: '2024-02-02',
    };
    it('수정할 프로젝트가 존재하지 않으면 BusinessException을 던진다', async () => {
      projectRepo.findOneBy.mockReturnValue(undefined);

      await expect(service.updateProject(projectId, dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('성공적으로 프로젝트를 수정하고 반환한다', async () => {
      const project = new Project();
      project.projectName = dto.projectName;
      project.round = dto.round;
      project.startDate = new Date(dto.startDate);
      project.endDate = new Date(dto.endDate);
      projectRepo.findOneBy.mockResolvedValue(project);

      const result = await service.updateProject(projectId, dto);

      expect(result);
    });
  });
});
