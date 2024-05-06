import { EntityManager, Repository } from 'typeorm';
import { Users } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<Users> {
  constructor(
    @InjectRepository(Users)
    private readonly repo: Repository<Users>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<Users> {
    return this.repo.findOneBy({ phoneNumber });
  }

  // async
}
