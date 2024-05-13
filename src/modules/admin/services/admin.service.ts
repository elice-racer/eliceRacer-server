import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/services/user.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import * as argon2 from 'argon2';
import { generateToken } from 'src/common/utils/verification-token-genertator';
import { MailService } from 'src/modules/mail/mail.service';
import { VerificationService } from 'src/modules/auth/services/verification.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly verificationService: VerificationService,
  ) {}
  async verifyEmail(id: string, token: string) {
    const result = await this.verificationService.verifyCode(id, token);
    if (!result) return result;

    this.verificationService.deleteVerificationCode(id);
    //TODO merge방식으로할지 update방식으로 할지 고민해보기
    const admin = await this.userService.findAnyUserById(id);

    if (result) this.userService.mergeAfterVerificationEamil(admin);
    return result;
  }

  async signup(dto: CreateAdminDto) {
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
    const user = await this.userService.findAnyUserByEmail(dto.email);

    if (user) throw new ConflictException('이미 가입한 회원입니다');

    const hashedPassword = await argon2.hash(dto.password);

    return await this.userService.createAdmin(dto, hashedPassword);
  }
}
