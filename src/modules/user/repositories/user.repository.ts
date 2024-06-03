import { EntityManager, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  PaginationCoachesDto,
  PaginationRacersByCardinalDto,
  PaginationRacersByTrackDto,
  PaginationRacersDto,
} from '../dto';

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

  async findAllCoaches(dto: PaginationCoachesDto) {
    const { lastRealName, lastId, pageSize } = dto;
    const pageSizeToInt = parseInt(pageSize);
    const role = UserRole.COACH;

    const query = this.repo
      .createQueryBuilder('users')
      .where('users.role = :role', { role })
      .orderBy('users.real_name', 'ASC')
      .addOrderBy('users.id', 'ASC');

    if (lastRealName && lastId) {
      query.andWhere(
        `(users.real_name > :lastRealName) OR (users.real_name = :lastRealName AND users.id > :lastId) `,
        { lastRealName, lastId },
      );
    }

    return await query.limit(pageSizeToInt + 1).getMany();
  }

  async findAllRcers(
    dto: PaginationRacersDto,
    pageSize: number,
  ): Promise<User[] | []> {
    const { lastTrackName, lastCardinalNo, lastRealName, lastId } = dto;
    const role = UserRole.RACER;

    const query = this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'tracks')
      .where('users.role = :role', { role })
      .orderBy('tracks.track_name', 'ASC')
      .addOrderBy('tracks.cardinal_no', 'ASC')
      .addOrderBy('users.real_name', 'ASC')
      .addOrderBy('users.id', 'ASC');

    if (lastTrackName && lastCardinalNo && lastRealName && lastId) {
      query.andWhere(
        `(tracks.track_name > :lastTrackName) OR (tracks.track_name = :lastTrackName AND tracks.cardinal_no > :lastCardinalNo) OR 
          (tracks.track_name = :lastTrackName AND tracks.cardinal_no = :lastCardinalNo AND users.real_name > :lastRealName) OR
          (tracks.track_name = :lastTrackName AND tracks.cardinal_no = :lastCardinalNo AND users.real_name = :lastRealName AND users.id > :lastId)`,
        { lastTrackName, lastCardinalNo, lastRealName, lastId },
      );
    }

    return await query.limit(pageSize + 1).getMany();
  }

  async findRacersByTrack(
    dto: PaginationRacersByTrackDto,
  ): Promise<User[] | []> {
    const { trackName, pageSize, lastRealName, lastId, lastCardinalNo } = dto;
    const pageSizeToInt = parseInt(pageSize);

    const role = UserRole.RACER;

    const query = this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'tracks')
      .where('tracks.track_name = :trackName', { trackName })
      .andWhere('users.role = :role', { role })
      .orderBy('tracks.cardinal_no', 'ASC')
      .addOrderBy('users.real_name', 'ASC')
      .addOrderBy('users.id', 'ASC');

    if (lastCardinalNo && lastRealName && lastId) {
      const lastcardinalNo = parseInt(lastCardinalNo);
      query.andWhere(
        `((tracks.cardinal_no > :lastcardinalNo) OR 
        (tracks.cardinal_no = :lastcardinalNo AND users.real_name > :lastRealName) OR
        (tracks.cardinal_no = :lastcardinalNo AND users.real_name = :lastRealName AND users.id > :lastId))`,
        { lastcardinalNo, lastRealName, lastId },
      );
    }

    return await query.limit(pageSizeToInt + 1).getMany();
  }

  async findRacersByTrackAndCardinalNo(
    dto: PaginationRacersByCardinalDto,
  ): Promise<User[] | []> {
    const { trackName, cardinalNo, pageSize, lastRealName, lastId } = dto;

    const role = UserRole.RACER;

    const query = this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'tracks')
      .where('tracks.track_name = :trackName', { trackName })
      .andWhere('users.role = :role', { role })
      .andWhere('tracks.cardinal_no = :cardinalNo', {
        cardinalNo: parseInt(cardinalNo),
      })
      .orderBy('users.real_name', 'ASC')
      .addOrderBy('users.id', 'ASC');

    if (lastRealName && lastId) {
      query.andWhere(
        `((users.real_name > :lastRealName) OR 
        (users.real_name = :lastRealName AND users.id > :lastId))`,
        { lastRealName, lastId },
      );
    }

    return query.limit(parseInt(pageSize) + 1).getMany();
  }

  async findUserByIdWithDetail(userId: string): Promise<User> | undefined {
    return this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'tracks')
      .leftJoinAndSelect('users.teams', 'teams')
      .leftJoinAndSelect('teams.project', 'projects')
      .addSelect(['projects.id', 'projects.project_name'])
      .where('users.id = :userId', { userId })
      .getOne();
  }
}
