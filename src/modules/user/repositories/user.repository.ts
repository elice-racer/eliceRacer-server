import { EntityManager, Repository } from 'typeorm';
import { User, UserStatus } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto';
import { TrackDto } from 'src/modules/track/dto';

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

  /**
   * 앞에 아무런 수식어가 없는 User = 회원가입 안 한 유저도 포함
   * registeredUser = 회원가입 한 유저만
   */

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
      .leftJoinAndSelect('users.track', 'tracks')
      .where('users.id = :userId', {
        userId,
      })
      .getOne();
  }

  async findUsersByTrack(
    trackDto: TrackDto,
    page: number,
    pageSize: number,
  ): Promise<[User[], number]> {
    const { trackName, cardinalNo } = trackDto;
    return this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'tracks')
      .where('tracks.trackName = :trackName', { trackName })
      .andWhere('tracks.cardinalNo = :cardinalNo', { cardinalNo })
      .orderBy('users.realName', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  async findAllUsers(page: number, pageSize: number) {
    return this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'tracks')
      .orderBy('users.realName', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }
}
