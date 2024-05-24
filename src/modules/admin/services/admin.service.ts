import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from '../dto/create-admin.dto';
import * as argon2 from 'argon2';
import { generateToken } from 'src/common/utils/verification-token-genertator';
import { MailService } from 'src/modules/mail/mail.service';
import { VerificationService } from 'src/modules/auth/services/verification.service';
import { AdminRepository } from '../repositories';
import { UserStatus } from 'src/modules/user/entities';
import { BusinessException } from 'src/exception';

@Injectable()
export class AdminService {
  constructor(
    private readonly mailService: MailService,
    private readonly verificationService: VerificationService,
    private readonly adminRepo: AdminRepository,
  ) {}
  async verifyEmail(id: string, token: string) {
    const result = await this.verificationService.verifyCode(id, token);
    if (!result) return result;

    this.verificationService.deleteVerificationCode(id);

    if (result)
      this.adminRepo.updateStatusAfterVerification(
        id,
        UserStatus.VERIFIED_AND_REGISTERED,
      );
    return result;
  }

  async signup(dto: CreateAdminDto): Promise<void> {
    const verificationToken = generateToken();

    const admin = await this.createAdmin(dto);

    await Promise.all([
      this.verificationService.setVerificationCode(
        admin.id,
        verificationToken,
        60 * 60,
      ),
      this.mailService.sendVerificationEmail(
        admin,
        verificationToken,
        'admins',
      ),
    ]);
  }

  async createAdmin(dto: CreateAdminDto) {
    const user = await this.adminRepo.findUserByEmailOrUsername(dto.email);

    if (user)
      throw new BusinessException(
        'admin',
        `${dto.email} already exist`,
        `${dto.email} already exist`,
        HttpStatus.BAD_REQUEST,
      );

    const hashedPassword = await argon2.hash(dto.password);

    return await this.adminRepo.createAdmin(dto, hashedPassword);
  }
}
