import { User, UserStatus } from 'src/modules/user/entities';
import { UserRepository } from 'src/modules/user/repositories';

export class AuthRepository {
  constructor(private readonly userRepo: UserRepository) {}

  async findUserById(userId: string): Promise<User> | undefined {
    return this.userRepo.findOne({
      where: { id: userId, status: UserStatus.VERIFIED_AND_REGISTERED },
    });
  }

  async findUserByEmailOrUsername(
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

  async registerPhone(phoneNumber: string) {
    const user = new User();
    user.phoneNumber = phoneNumber;
    user.status = UserStatus.VERIFIED;

    return this.userRepo.save(user);
  }

  async mergeAfterVerification(user: User): Promise<User> {
    const mergedUser = this.userRepo.merge(user, {
      status: UserStatus.VERIFIED,
    });

    return this.userRepo.save(mergedUser);
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<User> | undefined {
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
      .leftJoinAndSelect('users.tracks', 'tracks')
      .where('users.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne();
  }
}
