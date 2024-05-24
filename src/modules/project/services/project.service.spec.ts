import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from '../repositories/project.repository';
import { CreateProjectDto } from '../dto';
import { TrackRepository } from 'src/modules/track/repositories';
import { BusinessException } from 'src/exception';
import { Project } from '../entities';
import { Track } from 'src/modules/track/entities';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepo: jest.Mocked<ProjectRepository>;
  let trackRepo: jest.Mocked<TrackRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectService, ProjectRepository, TrackRepository],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectRepo = module.get(ProjectRepository);
    trackRepo = module.get(TrackRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProejct', () => {
    const dto: CreateProjectDto = {
      projectName: 'New Project',
      round: 1,
      startDate: new Date(),
      endDate: new Date(),
      trackName: 'Existing Track',
      cardinalNo: '1',
    };

    it('track이 존재하지 않으면 BusinessException을 반환한다', async () => {
      trackRepo.findOneBy.mockResolvedValueOnce(undefined);
      await expect(service.createProject(dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('project를 생성하고 반환한다', async () => {
      const project = new Project();
      const track = new Track();

      trackRepo.findOneBy.mockResolvedValueOnce(track);
      projectRepo.createProject.mockResolvedValueOnce(project);

      const result = await service.createProject(dto);

      expect(result).toEqual(project);
    });
  });
});
