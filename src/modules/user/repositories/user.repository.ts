import { EntityManager, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto';
import { CreateAdminDto } from 'src/modules/admin/dto/create-admin.dto';

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

  // 인증번호 검증 후 (등록 안된 회원)
  async registerPhone(phoneNumber: string) {
    const user = new User();
    user.phoneNumber = phoneNumber;
    user.status = UserStatus.VERIFIED;

    return this.repo.save(user);
  }

  // 인증번호 검증 후(등록된 회원)
  async mergeAfterVerification(user: User): Promise<User> {
    const mergedUser = this.repo.merge(user, {
      status: UserStatus.VERIFIED,
    });

    return this.repo.save(mergedUser);
  }

  async findUserByEmailOrUsername(
    identifier: string,
  ): Promise<User> | undefined {
    return this.repo
      .createQueryBuilder('users')
      .where(
        '(users.email = :identifier OR users.username = :identifier) AND users.status = :status',
        { identifier, status: UserStatus.VERIFIED_AND_REGISTERED },
      )
      .getOne();
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

  // 관리자 회원가입
  async createAdmin(
    dto: CreateAdminDto,
    hashedPassword: string,
  ): Promise<User> {
    const user = new User();
    user.email = dto.email;
    user.realName = dto.realName;
    user.password = hashedPassword;
    user.role = UserRole.ADMIN;
    return this.repo.save(user);
  }

  // 회원가입하지 않은 유저까지 모두 검색
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
