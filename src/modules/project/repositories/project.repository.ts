import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Project } from '../entities';
import { EntityManager, Repository } from 'typeorm';
import { CreateProjectDto } from '../dto';
import { Track } from 'src/modules/track/entities';

export class ProjectRepository extends Repository<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createProject(dto: CreateProjectDto, track: Track) {
    const project = new Project();

    project.projectName = dto.projectName;
    project.round = dto.round;
    project.startDate = dto.startDate;
    project.endDate = dto.endDate;
    project.track = track;

    return this.repo.save(project);
  }
}
