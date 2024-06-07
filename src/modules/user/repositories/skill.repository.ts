import { EntityManager, Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SkillRepository extends Repository<Skill> {
  constructor(
    @InjectRepository(Skill)
    private readonly repo: Repository<Skill>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async searchSkills(query: string): Promise<Skill[]> {
    return this.createQueryBuilder('skill')
      .where('skill.skill_name ILIKE :skillName', { skillName: `%${query}%` })
      .getMany();
  }
}
