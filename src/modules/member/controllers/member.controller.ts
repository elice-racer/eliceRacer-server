import { Controller } from '@nestjs/common';
import { MemberService } from '../services/member.service';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
}
