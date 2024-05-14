import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MemberService } from '../services/member.service';
import { AdminGuard } from 'src/common/guards';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('/upload')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    return this.memberService.importUsersFromExcel(file);
  }
}
