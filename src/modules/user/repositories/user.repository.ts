import { EntityManager, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  PaginationAllUsersDto,
  PaginationParticipantsDto,
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

  async findAllUsers(user: User, dto: PaginationAllUsersDto) {
    const {
      pageSize,
      trackName,
      cardinalNo,
      role,
      lastId,
      lastTrackName,
      lastCardinalNo,
      lastRealName,
    } = dto;

    const query = this.repo
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId: user.id })
      .leftJoinAndSelect('user.track', 'track')
      .orderBy('track.trackName', 'ASC')
      .addOrderBy('track.cardinalNo', 'ASC')
      .addOrderBy('user.realName', 'ASC')
      .addOrderBy('user.id', 'ASC');

    if (role !== 'ALL') query.andWhere('user.role = :role', { role });

    if (trackName !== 'ALL')
      query.andWhere('track.trackName = :trackName', { trackName });

    if (cardinalNo !== 0)
      query.andWhere('track.cardinalNo = :cardinalNo', { cardinalNo });

    if (lastRealName && lastId && lastTrackName && lastCardinalNo) {
      query.andWhere(
        '(track.trackName > :trackName) OR ' +
          '(track.trackName = :lastTrackName AND track.cardinalNo > :lastCardinalNo) OR ' +
          '(track.trackName = :lastTrackName AND track.cardinalNo = :lastCardinalNo AND user.realName > :lastRealName) OR ' +
          '(track.trackName = :lastTrackName AND track.cardinalNo = :lastCardinalNo AND user.realName = :lastRealName AND user.id > :lastId)',
        { lastRealName, lastId, lastTrackName, lastCardinalNo },
      );
    }

    return query.limit(pageSize + 1).getMany();
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
