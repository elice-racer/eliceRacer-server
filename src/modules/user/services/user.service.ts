import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { User, UserStatus } from '../entities';
import { CreateUserDto, updateReqDto } from '../dto';
import { hashPassword } from 'src/common/utils/password-hash';
import { BusinessException } from 'src/exception';
import { TrackRespository } from 'src/modules/track/repositories';
import { In } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly trackRepo: TrackRespository,
  ) {}

  async chang(username: string) {
    const user = await this.userRepo.findOneBy({ username });

    user.username = '';
    user.status = UserStatus.UNVERIFIED;

    return this.userRepo.save(user);
  }

  //트랙별 모든 suer
  async getAllUsersByTrack(
    trackName: string,
    page: number,
    pageSize: number,
  ): Promise<User[]> {
    const track = await this.trackRepo.findOneBy({ trackName });
    if (!track)
      throw new BusinessException(
        `user`,
        `해당 트랙(${trackName})이 존재하지 않습니다.`,
        `해당 트랙(${trackName})이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    const [users, total] = await this.userRepo.findUsersByTrackName(
      trackName,
      page,
      pageSize,
    );

    if (total === 0)
      throw new BusinessException(
        `user`,
        `등록된 레이서가 존재하지 않습니다.`,
        `등록된 레이서가 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    return users;
  }

  async updateMypage(userId: string, dto: updateReqDto): Promise<User> {
    const user = await this.userRepo.findUserByIdWithTracks(userId);
    if (!user) {
      throw new BusinessException(
        'user',
        `유저를 찾을 수 없습니다`,
        `유저를 찾을 수 없습니다`,
        HttpStatus.BAD_REQUEST,
      );
    }

    user.realName = dto.realName;
    user.github = dto.github;
    user.position = dto.position;

    return this.userRepo.save(user);
  }

  async updateUserTracks(userId: string, trackNames: string[]): Promise<User> {
    const user = await this.userRepo.findUserByIdWithTracks(userId);
    if (!user) {
      throw new BusinessException(
        'user',
        `유저를 찾을 수 없습니다`,
        `유저를 찾을 수 없습니다`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const tracks = await this.trackRepo.find({
      where: { trackName: In(trackNames) },
    });

    if (tracks.length !== trackNames.length) {
      const foundTrackNames = tracks.map((track) => track.trackName);
      const missingTrackNames = trackNames.filter(
        (trackName) => !foundTrackNames.includes(trackName),
      );
      throw new BusinessException(
        'user',
        `트랙을 찾을 수 없습니다: ${missingTrackNames.join(', ')}`,
        `트랙을 찾을 수 없습니다: ${missingTrackNames.join(', ')}`,
        HttpStatus.NOT_FOUND,
      );
    }

    user.tracks = tracks;
    return await this.userRepo.save(user);
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
}
