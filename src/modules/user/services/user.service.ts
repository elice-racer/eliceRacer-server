import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { Users } from '../entities';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async findUserByPhoneNumber(phoneNumber: string): Promise<Users> | undefined {
    return this.userRepo.findUserByPhoneNumber(phoneNumber);
  }
}
