import { EntityManager, Repository } from 'typeorm';
import { User, UserStatus } from '../entities';
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

  // 유저 코치 회원가입시 사용
  async mergeUser(
    user: User,
    dto: CreateUserDto,
    hashedPassword: string,
  ): Promise<User> {
    const mergedUser = this.repo.merge(user, {
      username: dto.username,
      password: hashedPassword,
      realName: dto.realName,
      status: UserStatus.VERIFIED_AND_REGISTERED,
    });

    return this.repo.save(mergedUser);
  }

  async findUserByIdWithTracks(userId: string): Promise<User> | undefined {
    return this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.tracks', 'tracks')
      .where('(users.id = :userId) AND users.status = :status', {
        userId,
        status: UserStatus.VERIFIED_AND_REGISTERED,
      })
      .getOne();
  }

  async findUsersByTrackName(
    trackName: string,
    page: number,
    pageSize: number,
  ): Promise<[User[], number]> {
    return this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.tracks', 'tracks')
      .where('tracks.trackName = :trackName', { trackName })
      .orderBy('users.realName', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }
}
