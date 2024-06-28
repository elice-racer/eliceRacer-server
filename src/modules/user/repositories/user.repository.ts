import { EntityManager, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  PaginationParticipantsDto,
  PaginationRacersByCardinalDto,
  PaginationRacersByTrackDto,
  PaginationRacersDto,
  PaginationUsersDto,
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

  async findAllUsers(user: User, dto: PaginationUsersDto) {
    const { lastRealName, lastId, pageSize, role } = dto;

    const query = this.repo
      .createQueryBuilder('users')
      .andWhere('user.id != :userId', { userId: user.id })
      .orderBy('users.realName', 'ASC')
      .addOrderBy('users.id', 'ASC');

    if (role !== 'ALL') {
      query.where('users.role = :role', { role });
    }
    if (lastRealName && lastId) {
      query.andWhere(
        `(users.realName > :lastRealName) OR (users.realName = :lastRealName AND users.id > :lastId) `,
        { lastRealName, lastId },
      );
    }

    return await query.limit(pageSize + 1).getMany();
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
      .orderBy('tracks.trackName', 'ASC')
      .addOrderBy('tracks.cardinalNo', 'ASC')
      .addOrderBy('users.realName', 'ASC')
      .addOrderBy('users.id', 'ASC');

    if (lastTrackName && lastCardinalNo && lastRealName && lastId) {
      query.andWhere(
        `(tracks.trackName > :lastTrackName) OR (tracks.trackName = :lastTrackName AND tracks.cardinalNo > :lastCardinalNo) OR 
          (tracks.trackName = :lastTrackName AND tracks.cardinalNo = :lastCardinalNo AND users.realName > :lastRealName) OR
          (tracks.trackName = :lastTrackName AND tracks.cardinalNo = :lastCardinalNo AND users.realName = :lastRealName AND users.id > :lastId)`,
        { lastTrackName, lastCardinalNo, lastRealName, lastId },
      );
    }

    return await query.limit(pageSize + 1).getMany();
  }

  async findRacersByTrack(
    dto: PaginationRacersByTrackDto,
  ): Promise<User[] | []> {
    const { trackName, pageSize, lastRealName, lastId, lastCardinalNo } = dto;

    const role = UserRole.RACER;

    const query = this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'tracks')
      .where('tracks.trackName = :trackName', { trackName })
      .andWhere('users.role = :role', { role })
      .orderBy('tracks.cardinalNo', 'ASC')
      .addOrderBy('users.realName', 'ASC')
      .addOrderBy('users.id', 'ASC');

    if (lastCardinalNo && lastRealName && lastId) {
      query.andWhere(
        `((tracks.cardinalNo > :lastcardinalNo) OR 
        (tracks.cardinalNo = :lastcardinalNo AND users.realName > :lastRealName) OR
        (tracks.cardinalNo = :lastcardinalNo AND users.realName = :lastRealName AND users.id > :lastId))`,
        { lastCardinalNo, lastRealName, lastId },
      );
    }

    return await query.limit(pageSize + 1).getMany();
  }

  async findRacersByTrackAndCardinalNo(
    dto: PaginationRacersByCardinalDto,
  ): Promise<User[] | []> {
    const { trackName, cardinalNo, pageSize, lastRealName, lastId } = dto;

    const role = UserRole.RACER;

    const query = this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'tracks')
      .where('tracks.trackName = :trackName', { trackName })
      .andWhere('users.role = :role', { role })
      .andWhere('tracks.cardinalNo = :cardinalNo', {
        cardinalNo,
      })
      .orderBy('users.realName', 'ASC')
      .addOrderBy('users.id', 'ASC');

    if (lastRealName && lastId) {
      query.andWhere(
        `((users.realName > :lastRealName) OR 
        (users.realName = :lastRealName AND users.id > :lastId))`,
        { lastRealName, lastId },
      );
    }

    return query.limit(pageSize + 1).getMany();
  }

  async findUserByIdWithDetail(userId: string): Promise<User> | undefined {
    return this.repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'track') // 'track'로 변경
      .leftJoinAndSelect('users.teams', 'teams')
      .leftJoinAndSelect('teams.project', 'projects')
      .leftJoinAndSelect('users.skills', 'skills') // skills 조인 추가
      .addSelect([
        'projects.id',
        'projects.projectName',
        'skills.id',
        'skills.skillName',
      ])
      .where('users.id = :userId', { userId })
      .getOne();
  }

  async findProjectParticipants(user: User, dto: PaginationParticipantsDto) {
    const { pageSize, lastRealName, lastId } = dto;

    const query = this.repo
      .createQueryBuilder('user')
      .leftJoin('user.teams', 'team')
      .leftJoin('team.project', 'project')
      .where('project.trackId = :trackId', { trackId: user.track.id })
      .andWhere('user.id != :userId', { userId: user.id }) // 당사자 제외 조건 추가
      .leftJoinAndSelect('user.track', 'track');

    // 관리자 또는 코치 역할을 가진 사용자를 포함하도록 조건을 추가
    query
      .orWhere('user.role = :adminRole', { adminRole: UserRole.ADMIN })
      .orWhere('user.role = :coachRole', { coachRole: UserRole.COACH })
      .orderBy('user.realName', 'DESC')
      .addOrderBy('user.id', 'DESC');

    // 페이징을 위한 마지막 이름과 ID 조건 처리
    if (lastRealName && lastId) {
      query
        .andWhere('user.realName < :lastRealName', { lastRealName })
        .orWhere('user.realName = :lastRealName AND user.id < :lastId', {
          lastRealName,
          lastId,
        });
    }

    return query.limit(pageSize + 1).getMany();
  }

  async searchUsers(query: string) {
    return this.createQueryBuilder('user')
      .where(`user.realName ILIKE :realName`, { realName: `%${query}%` })
      .getMany();
  }
}
