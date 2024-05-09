import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../repositories';
import { User } from '../entities';
import { CreateUserDto } from '../dto';
import { hashPassword } from 'src/common/utils/password-hash';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async validate(userId: string): Promise<User> | undefined {
    const user = await this.findUserById(userId);
    if (!user) throw new NotFoundException('존재하지 않는 회원입니다');
    return user;
  }

  async handleSignUp(dto: CreateUserDto) {
    const user = await this.findAnyUserByPhoneWithTrack(dto.phoneNumber);

    if (!user || user?.status === 0)
      throw new UnauthorizedException('핸드폰 인증을 완료해주세요');

    if (user?.username === dto.username && user.status === 2)
      throw new ConflictException('이미 존재하는 아이디입니다');
    const hashedPassword = await hashPassword(dto.password);

    await this.mergeUser(user, dto, hashedPassword);
  }

  async mergeUser(
    user: User,
    dto: CreateUserDto,
    hashedPassword: string,
  ): Promise<User> {
    return this.userRepo.mergeUser(user, dto, hashedPassword);
  }

  async mergePhone(user: User) {
    return this.userRepo.mergePhone(user);
  }
  async registerPhone(phoneNumber: string) {
    return this.userRepo.registerPhone(phoneNumber);
  }
  async createUser(dto: CreateUserDto, hashPassword: string) {
    return this.userRepo.createUser(dto, hashPassword);
  }
  async findUserByEmailOrUsername(
    identifier: string,
  ): Promise<User> | undefined {
    return this.userRepo.findUserByEmailOrUsername(identifier);
  }

  async findUserByEmail(email: string) {
    return this.userRepo.findOne({ where: { email, status: 2 } });
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<User> | undefined {
    return this.userRepo.findOne({ where: { phoneNumber, status: 2 } });
  }

  async findAnyUserByPhoneWithTrack(
    phoneNumber: string,
  ): Promise<User> | undefined {
    return this.userRepo.findAnyUserByPhoneWithTrack(phoneNumber);
  }

  async findUserById(userId: string): Promise<User> | undefined {
    return this.userRepo.findOne({ where: { id: userId, status: 2 } });
  }
}
