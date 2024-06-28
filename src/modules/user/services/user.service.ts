import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { User, UserRole, UserStatus } from '../entities';
import {
  CreateUserDto,
  PaginationParticipantsDto,
  PaginationRacersByCardinalDto,
  PaginationRacersByTrackDto,
  PaginationRacersDto,
  PaginationUsersDto,
  updateUserReqDto,
} from '../dto';
import { hashPassword } from 'src/common/utils';
import { BusinessException } from 'src/exception';
import { TrackRepository } from 'src/modules/track/repositories';
import { TrackDto } from 'src/modules/track/dto';
import { ConfigService } from '@nestjs/config';
import { ENV_SERVER_URL_KEY } from 'src/common/const';
import { SkillService } from './skill.service';
import { UploadService } from 'src/modules/upload/services/upload.service';

@Injectable()
export class UserService {
  private baseUrl;
  constructor(
    private readonly userRepo: UserRepository,
    private readonly trackRepo: TrackRepository,
    private readonly configService: ConfigService,
    private readonly skillService: SkillService,
    private uploadService: UploadService,
  ) {
    this.baseUrl = configService.get<string>(ENV_SERVER_URL_KEY);
  }

  async chang(identifier: string) {
    const user = await this.userRepo
      .createQueryBuilder('users')
      .where(
        '(users.email = :identifier OR users.username = :identifier) AND users.status = :status',
        { identifier, status: UserStatus.VERIFIED_AND_REGISTERED },
      )
      .getOne();

    user.username = null;
    user.password = null;
    user.status = UserStatus.UNVERIFIED;

    return this.userRepo.save(user);
  }

  async getUser(userId: string): Promise<User> | undefined {
    const userWithDetail = await this.userRepo.findUserByIdWithDetail(userId);

    if (!userWithDetail)
      throw new BusinessException(
        `user`,
        `사용자가 존재하지 않습니다.`,
        `사용자가 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    return userWithDetail;
  }

  async getAllUsers(user: User, dto: PaginationUsersDto) {
    const { pageSize, role } = dto;

    const users = await this.userRepo.findAllUsers(user, dto);

    let next: string | null = null;

    if (users.length > pageSize) {
      const lastUser = users[pageSize - 1];
      next = `${this.baseUrl}/api/users/all?pageSize=${pageSize}&role=${role.toLowerCase()}&lastRealName=${lastUser.realName}&lastId=${lastUser.id}`;
      users.pop();
    }

    return { users, pagination: { next, count: users.length } };
  }

  //모든 레이서
  async getAllRacres(dto: PaginationRacersDto) {
    const { pageSize } = dto;

    const users = await this.userRepo.findAllRcers(dto, pageSize);

    let next: string | null = null;

    if (users.length > pageSize) {
      const lastUser = users[pageSize - 1];
      next = `${this.baseUrl}/api/users/racers/all?pageSize=${pageSize}&lastTrackName=${lastUser.track.trackName}&lastCardinalNo=${lastUser.track.cardinalNo}&lastRealName=${lastUser.realName}&lastId=${lastUser.id}`;
      users.pop();
    }

    return { users, pagination: { next, count: users.length } };
  }

  //트랙별 모든 레이서
  async getAllRacersByTrack(dto: PaginationRacersByTrackDto) {
    const { trackName, pageSize } = dto;

    const track = await this.trackRepo.findOne({ where: { trackName } });

    if (!track)
      throw new BusinessException(
        `user`,
        `해당 트랙(${trackName})이 존재하지 않습니다.`,
        `해당 트랙(${trackName})이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    const users = await this.userRepo.findRacersByTrack(dto);

    let next: string | null = null;
    if (users.length > pageSize) {
      const lastUser = users[pageSize - 1];
      next = `${this.baseUrl}/api/users/racers/tracks/all?pageSize=${pageSize}&trackName=${trackName}&lastCardinalNo=${lastUser.track.cardinalNo}&lastRealName=${lastUser.realName}&lastId=${lastUser.id}`;
      users.pop();
    }

    return { users, pagination: { next, count: users.length } };
  }

  //트랙+기수별 모든 레이서
  async getAllRacersByCardinalNo(dto: PaginationRacersByCardinalDto) {
    const { trackName, cardinalNo, pageSize } = dto;

    const track = await this.trackRepo.findOne({
      where: { trackName, cardinalNo },
    });

    if (!track)
      throw new BusinessException(
        `user`,
        `해당 트랙(${trackName}${cardinalNo})이 존재하지 않습니다.`,
        `해당 트랙(${trackName}${cardinalNo})이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    const users = await this.userRepo.findRacersByTrackAndCardinalNo(dto);

    let next: string | null = null;
    if (users.length > pageSize) {
      const lastUser = users[pageSize - 1];
      next = `${this.baseUrl}/api/users/racers/cardinals/all?pageSize=${pageSize}&trackName=${trackName}&cardinalNo=${cardinalNo}&lastRealName=${lastUser.realName}&lastId=${lastUser.id}`;

      users.pop();
    }

    return { users, pagination: { next, count: users.length } };
  }

  async updateUserRole(userId: string, role: UserRole) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user)
      throw new BusinessException(
        `user`,
        `사용자가 존재하지 않습니다.`,
        `사용자가 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    user.role = role;

    return this.userRepo.save(user);
  }

  async updateMypage(userId: string, dto: updateUserReqDto): Promise<User> {
    const user = await this.userRepo.findUserByIdWithTracks(userId);
    if (!user) {
      throw new BusinessException(
        'user',
        `유저를 찾을 수 없습니다`,
        `유저를 찾을 수 없습니다`,
        HttpStatus.BAD_REQUEST,
      );
    }

    Object.assign(user, dto);

    return this.userRepo.save(user);
  }

  async updateSkills(userId: string, skillNames: string[]) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['skills'],
    });

    if (!user) {
      throw new BusinessException(
        'user',
        `유저를 찾을 수 없습니다`,
        `유저를 찾을 수 없습니다`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const skills = await this.skillService.updateSkills(skillNames);

    user.skills = skills;

    await this.userRepo.save(user);

    return skills;
  }

  async updateUserTracks(userId: string, trackDto: TrackDto) {
    const { trackName, cardinalNo } = trackDto;
    const user = await this.userRepo.findUserByIdWithTracks(userId);
    if (!user) {
      throw new BusinessException(
        'admin',
        `유저를 찾을 수 없습니다`,
        `유저를 찾을 수 없습니다`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const track = await this.trackRepo.findOne({
      where: { trackName: trackDto.trackName, cardinalNo: trackDto.cardinalNo },
    });

    if (user.role !== UserRole.RACER)
      throw new BusinessException(
        'admin',
        `${user.role}는 트랙을 변경할 수 없습니다.`,
        `${user.role}는 트랙을 변경할 수 없습니다.`,
        HttpStatus.FORBIDDEN,
      );

    if (!track)
      throw new BusinessException(
        'admin',
        `트랙을 찾을 수 없습니다: ${trackName}${cardinalNo}`,
        `트랙을 찾을 수 없습니다: ${trackName}${cardinalNo} 트랙을 먼저 등록해주세요`,
        HttpStatus.NOT_FOUND,
      );

    user.track = track;
    return this.userRepo.save(user);
  }

  async validate(userId: string): Promise<User> | undefined {
    const user = await this.findUserById(userId);
    if (!user)
      throw new BusinessException(
        'user',
        `유저를 찾을 수 없습니다`,
        `유저를 찾을 수 없습니다`,
        HttpStatus.BAD_REQUEST,
      );

    return user;
  }

  // 회원가입 컨트롤
  async handleSignUp(dto: CreateUserDto) {
    const user = await this.findAnyUserByPhone(dto.phoneNumber);

    if (!user || user?.status === 0)
      throw new BusinessException(
        'user',
        `핸드폰 미인증`,
        `핸드폰 인증을 완료해주세요`,
        HttpStatus.UNAUTHORIZED,
      );

    if (user?.username === dto.username && user.status === 2)
      throw new BusinessException(
        'user',
        `이미 가입된 아이디`,
        `이미 존재하는 아이디 입니다`,
        HttpStatus.CONFLICT,
      );
    const hashedPassword = await hashPassword(dto.password);

    await this.mergeUser(user, dto, hashedPassword);
  }

  // 회원가입 시 유저 업데이트
  async mergeUser(
    user: User,
    dto: CreateUserDto,
    hashedPassword: string,
  ): Promise<User> {
    return this.userRepo.mergeUser(user, dto, hashedPassword);
  }

  async findAnyUserById(userId: string): Promise<User> | undefined {
    return this.userRepo.findOneBy({ id: userId });
  }
  async findUserById(userId: string): Promise<User> | undefined {
    return this.userRepo.findOne({
      where: { id: userId, status: UserStatus.VERIFIED_AND_REGISTERED },
    });
  }
  async findAnyUserByPhone(phoneNumber: string): Promise<User> | undefined {
    return this.userRepo.findOneBy({ phoneNumber });
  }

  async findUserWithTrackAndTeams(id: string): Promise<User | undefined> {
    return this.userRepo.findOne({
      where: { id: id },
      relations: ['track', 'teams', 'skills'],
    });
  }

  async deleteUser(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user)
      throw new BusinessException(
        `user`,
        `사용자가 존재하지 않습니다.`,
        `사용자가 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    return this.userRepo.remove(user);
  }

  async getProjectParticipants(userId: string, dto: PaginationParticipantsDto) {
    const { pageSize } = dto;
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['track'],
    });

    if (!user.track)
      throw new BusinessException(
        `user`,
        `유저가 소속된 트랙이 존재하지 않습니다.`,
        `유저가 소속된 트랙이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    const users = await this.userRepo.findProjectParticipants(user, dto);

    let next: string | null = null;
    if (users.length > pageSize) {
      const lastUser = users[pageSize - 1];
      next = `${this.baseUrl}/api/users?pageSize=${pageSize}&lastRealName=${lastUser.realName}&lastId=${lastUser.id}`;
      users.pop();
    }
    return { users, pagination: { next, count: users.length } };
  }

  async searchUsers(query: string) {
    return this.userRepo.searchUsers(query);
  }

  async uploadProfileImage(file: Express.Multer.File, user: User) {
    const currentImageUrl = user.profileImage;

    if (currentImageUrl) {
      await this.uploadService.deleteFile(currentImageUrl);
    }

    const newImageUrl = await this.uploadService.uploadFile(file);

    user.profileImage = newImageUrl;

    return this.userRepo.save(user);
  }
}
