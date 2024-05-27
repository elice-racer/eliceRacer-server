import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Project } from '../entities';
import { EntityManager, Repository } from 'typeorm';

export class ProjectRepository extends Repository<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
