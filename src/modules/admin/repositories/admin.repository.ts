import { User, UserRole, UserStatus } from 'src/modules/user/entities';
import { UserRepository } from 'src/modules/user/repositories';
import { CreateAdminReqDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(UserRepository)
    private userRepo: UserRepository,
  ) {}

  async updateStatusAfterVerification(
    userId: string,
    newStatus: UserStatus,
  ): Promise<void> {
    await this.userRepo.update(userId, { status: newStatus });
  }

  //이메일이랑 아이디 모두 포함
  async findUserByEmailOrUsername(email: string): Promise<User> | undefined {
    return this.userRepo.findOne({
      where: [{ email: email }, { username: email }],
    });
  }

  async createAdmin(
    dto: CreateAdminReqDto,
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
