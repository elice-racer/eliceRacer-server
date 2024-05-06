import { ConflictException, Injectable } from '@nestjs/common';
import { SmsService } from 'src/modules/sms/services/sms.service';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SmsService,
    private readonly userService: UserService,
  ) {}

  async authencticatePhoneNumber(phoneNumber: string) {
    const user = await this.userService.findUserByPhoneNumber(phoneNumber);

    if (user?.isVerified)
      throw new ConflictException('이미 사용하고 있는 번호 입니다.');

    return true;
  }
}
