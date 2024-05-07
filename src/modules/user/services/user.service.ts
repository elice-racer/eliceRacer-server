import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { User } from '../entities';
import { CreateUserDto } from '../dto';
import { hashPassword } from 'src/common/utils/password-hash';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async handleSignUp(dto: CreateUserDto) {
    const user = await this.findUserByPhoneNumber(dto.phoneNumber);

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

  async findUserByPhoneNumber(phoneNumber: string): Promise<User> | undefined {
    return this.userRepo.findOneBy({ phoneNumber });
  }

  async findUserByPhoneNumberWithTrack(
    phoneNumber: string,
  ): Promise<User> | undefined {
    return this.userRepo.findUserByPhoneNumberWithTrack(phoneNumber);
  }
}
