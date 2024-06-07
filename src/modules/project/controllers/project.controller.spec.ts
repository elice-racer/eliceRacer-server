import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from '../services/project.service';
import { TrackRepository } from 'src/modules/track/repositories';
import { ProjectRepository } from '../repositories/project.repository';
import { ConfigService } from '@nestjs/config';

describe('ProjectController', () => {
  let controller: ProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        ProjectService,
        TrackRepository,
        ProjectRepository,
        ConfigService,
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
