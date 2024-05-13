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
  async verifyEmail(email: string, token: string) {
    const result = await this.verificationService.verifyCode(email, token);
    if (!result) return result;

    //TODO merge방식으로할지 update방식으로 할지 고민해보기
    const admin = await this.userService.findUserByEmailOrUsername(email);

    if (result) this.userService.mergeAfterVerification(admin);
    return result;
  }

  async signup(dto: CreateAdminDto) {
    const verificationToken = generateToken();

    const [admin] = await Promise.all([
      this.createAdmin(dto),
      this.verificationService.setVerificationCode(
        dto.email,
        verificationToken,
        60 * 60,
      ),
    ]);

    await this.mailService.sendVerificationEmail(
      admin,
      verificationToken,
      'admins',
    );
  }

  async createAdmin(dto: CreateAdminDto) {
    const user = await this.userService.findUserByEmailOrUsername(dto.email);

    if (user) throw new ConflictException('이미 가입한 회원입니다');

    const hashedPassword = await argon2.hash(dto.password);

    return await this.userService.createAdmin(dto, hashedPassword);
  }
}
