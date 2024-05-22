import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto, VerifyEamilDto } from '../dto';
import { ResponseInterceptor } from 'src/interceptors';

@UseInterceptors(ResponseInterceptor)
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/signup')
  async singup(@Body() dto: CreateAdminDto) {
    return await this.adminService.signup(dto);
  }
  @Get('/verify-email')
  async verifyEmail(@Query() dto: VerifyEamilDto) {
    const result = await this.adminService.verifyEmail(dto.id, dto.token);
    if (result) return '성공';
    if (!result) return '실패';
  }
}
