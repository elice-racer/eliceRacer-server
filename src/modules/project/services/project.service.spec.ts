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

  describe('updateProject', () => {
    const projectId = 'uuid';
    const dto: UpdateProjectReqDto = {
      projectName: 'update-project',
      round: 3,
      startDate: '2024-01-01',
      endDate: '2024-02-02',
    };
    it('update할 projec가 존재하지 않으면 BusinessException을 던진다', async () => {
      projectRepo.findOneBy.mockReturnValue(undefined);

      await expect(service.updateProject(projectId, dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('성공적으로 project를 update하고 반환한다', async () => {
      const project = new Project();
      project.projectName = dto.projectName;
      project.round = dto.round;

      projectRepo.findOneBy.mockResolvedValue(project);

      const result = await service.updateProject(projectId, dto);

      expect(result);
    });
  });
});
