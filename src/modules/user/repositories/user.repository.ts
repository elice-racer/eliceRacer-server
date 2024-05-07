import { EntityManager, Repository } from 'typeorm';
import { User } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async mergeUser(
    user: User,
    dto: CreateUserDto,
    hashedPassword: string,
  ): Promise<User> {
    const mergedUser = this.repo.merge(user, {
      username: dto.username,
      password: hashedPassword,
      realName: dto.realName,
      isSigned: true,
    });

    return this.repo.save(mergedUser);
  }
  async createUser(dto: CreateUserDto, hashedPassword: string): Promise<User> {
    const user = new User();
    user.realName = dto.realName;
    user.password = hashedPassword;
    user.phoneNumber = dto.phoneNumber;
    user.isSigned = true;

    return this.repo.save(user);
  }

  async findUserByPhoneNumberWithTrack(
    phoneNumber: string,
  ): Promise<User> | undefined {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.track', 'track')
      .where('users.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne();
  }
}
