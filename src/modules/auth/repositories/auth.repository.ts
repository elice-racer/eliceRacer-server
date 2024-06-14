import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/modules/user/entities';
import { UserRepository } from 'src/modules/user/repositories';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(UserRepository)
    private userRepo: UserRepository,
  ) {}

  async findRegisteredUserById(userId: string): Promise<User> | undefined {
    return this.userRepo.findOne({
      where: { id: userId, status: UserStatus.VERIFIED_AND_REGISTERED },
    });
  }

  async findRegisteredUserByEmailOrUsername(
    identifier: string,
  ): Promise<User> | undefined {
    return this.userRepo
      .createQueryBuilder('users')
      .where(
        '(users.email = :identifier OR users.username = :identifier) AND users.status = :status',
        { identifier, status: UserStatus.VERIFIED_AND_REGISTERED },
      )
      .getOne();
  }

  async registerUser(phoneNumber: string, realName: string) {
    const user = new User();
    user.phoneNumber = phoneNumber;
    user.realName = realName;
    user.status = UserStatus.VERIFIED;
    user.track = null;

    return this.userRepo.save(user);
  }

  async updateUserStatus(userId: string, newStatus: UserStatus): Promise<void> {
    await this.userRepo.update(userId, { status: newStatus });
  }

  async findRegisteredUserByPhoneNumber(
    phoneNumber: string,
  ): Promise<User> | undefined {
    return this.userRepo.findOne({
      where: { phoneNumber, status: UserStatus.VERIFIED_AND_REGISTERED },
    });
  }

  //--------회원가입 하지 않은 유저 포함---------
  async findAnyUserByPhoneWithTrack(
    phoneNumber: string,
  ): Promise<User> | undefined {
    return this.userRepo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.track', 'tracks')
      .where('users.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne();
  }

  async updateUserPassword(user: User, hashedPassword) {
    user.password = hashedPassword;

    return this.userRepo.save(user);
  }
}
