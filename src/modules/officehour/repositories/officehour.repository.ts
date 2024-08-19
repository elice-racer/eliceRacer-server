import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Officehour } from '../entities/officehour.entity';

@Injectable()
export class OfficehourRepository extends Repository<Officehour> {
  constructor(
    @InjectRepository(Officehour) private readonly repo: Repository<Officehour>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async updateOfficehour() {}
}
