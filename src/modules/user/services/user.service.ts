import {
  ConflictException,
  Injectable,
  NotFoundException,
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
    const user = await this.findUserByPhoneNumberWithTrack(dto.phoneNumber);

    if (user?.username === dto.username)
      throw new ConflictException('이미 존재하는 아이디입니다');
    const hashedPassword = await hashPassword(dto.password);

    if (user) await this.mergeUser(user, dto, hashedPassword);

    if (!user) await this.createUser(dto, hashedPassword);
  }

  async mergeUser(
    user: User,
    dto: CreateUserDto,
    hashedPassword: string,
  ): Promise<User> {
    return this.userRepo.mergeUser(user, dto, hashedPassword);
  }

  async createUser(dto: CreateUserDto, hashPassword: string) {
    return this.userRepo.createUser(dto, hashPassword);
  }
  async findUserByEmailOrUsername(
    identifier: string,
  ): Promise<User> | undefined {
    return this.userRepo.findUserByEmailOrUsername(identifier);
  }

  async findUserByPhoneNumberIncludingNonMembers(
    phoneNumber: string,
  ): Promise<User> | undefined {
    return this.userRepo.findOne({ where: { phoneNumber, isSigned: true } });
  }

  async findUserByPhoneNumberWithTrack(
    phoneNumber: string,
  ): Promise<User> | undefined {
    return this.userRepo.findUserByPhoneNumberWithTrack(phoneNumber);
  }

  async findUserById(userId: string): Promise<User> | undefined {
    return this.userRepo.findOne({ where: { id: userId, isSigned: true } });
  }
}
