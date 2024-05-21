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

  async updateStatusAfterVerification(
    userId: string,
    newStatus: UserStatus,
  ): Promise<void> {
    await this.userRepo.update(userId, { status: newStatus });
  }

  //이메일이랑 아이디 모두 포함
  async findAnyUserByEmail(email: string): Promise<User> | undefined {
    return this.userRepo.findOne({
      where: [{ email: email }, { username: email }],
    });
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
