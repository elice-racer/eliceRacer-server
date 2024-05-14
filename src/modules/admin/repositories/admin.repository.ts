import { User, UserRole, UserStatus } from 'src/modules/user/entities';
import { UserRepository } from 'src/modules/user/repositories';
import { CreateAdminDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';

export class AdminRepository {
  constructor(
    @InjectRepository(UserRepository)
    private userRepo: UserRepository,
  ) {}

  async findAnyAdminById(userId: string): Promise<User> | undefined {
    return this.userRepo.findOneBy({ id: userId });
  }

  async mergeAfterVerification(admin: User): Promise<User> {
    const mergedUser = this.userRepo.merge(admin, {
      status: UserStatus.VERIFIED_AND_REGISTERED,
    });

    return this.userRepo.save(mergedUser);
  }

  async findAnyAdminByEmail(email: string): Promise<User> | undefined {
    return this.userRepo.findOneBy({ email });
  }

  async createAdmin(
    dto: CreateAdminDto,
    hashedPassword: string,
  ): Promise<User> {
    const user = new User();
    user.email = dto.email;
    user.realName = dto.realName;
    user.password = hashedPassword;
    user.role = UserRole.ADMIN;
    return this.userRepo.save(user);
  }
}
