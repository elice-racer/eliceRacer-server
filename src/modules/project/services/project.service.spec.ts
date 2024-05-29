import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from '../repositories/project.repository';

import { TrackRepository } from 'src/modules/track/repositories';
import { UpdateProjectReqDto } from '../dto';
import { BusinessException } from 'src/exception';
import { Project } from '../entities';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepo: jest.Mocked<ProjectRepository>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectService, ProjectRepository, TrackRepository],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectRepo = module.get(ProjectRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProject', () => {
    const projectId = 'uuid';

    it('프로젝트가 존재하지 않으면 BusinessException을 던진다', async () => {
      projectRepo.findOneBy.mockReturnValue(undefined);

      await expect(service.getProject(projectId)).rejects.toThrow(
        BusinessException,
      );
    });

    it('프로젝트가 존재하면 해당 프로젝트를 반환해준다', async () => {
      const project = new Project();

      projectRepo.findOneBy.mockResolvedValue(project);

      const result = await service.getProject(projectId);

      expect(result).toEqual(project);
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
