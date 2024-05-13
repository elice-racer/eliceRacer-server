import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/services/user.service';
// import * as XLSX from 'xlsx';

@Injectable()
export class MemberService {
  constructor(private readonly userService: UserService) {}

  async importMembersFromExcel() {}
}
