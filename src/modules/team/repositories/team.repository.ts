import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Team } from '../entities/team.entity';

export class TeamRepository extends Repository<Team> {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
