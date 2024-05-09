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

  async registerPhone(phoneNumber: string) {
    const user = new User();
    user.phoneNumber = phoneNumber;
    user.status = 1;

    return this.repo.save(user);
  }
  async mergePhone(user: User): Promise<User> {
    const mergedPhone = this.repo.merge(user, {
      status: 1,
    });

    return this.repo.save(mergedPhone);
  }
  async findUserByEmailOrUsername(
    identifier: string,
  ): Promise<User> | undefined {
    console.log(identifier);
    return this.repo
      .createQueryBuilder('users')
      .where(
        '(users.email = :identifier OR users.username = :identifier) AND users.status = :status',
        { identifier, status: 2 },
      )
      .getOne();
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
      status: 2,
    });

    return this.repo.save(mergedUser);
  }
  async createUser(dto: CreateUserDto, hashedPassword: string): Promise<User> {
    const user = new User();
    user.username = dto.username;
    user.realName = dto.realName;
    user.password = hashedPassword;
    user.phoneNumber = dto.phoneNumber;
    user.status = 2;

    return this.repo.save(user);
  }

  async findAnyUserByPhoneWithTrack(
    phoneNumber: string,
  ): Promise<User> | undefined {
    return this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.tracks', 'tracks')
      .where('users.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne();
  }
}
