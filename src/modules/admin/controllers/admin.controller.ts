import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto, VerifyEamilDto } from '../dto';
import { ResponseInterceptor, Serialize } from 'src/interceptors';
import { TrackService } from 'src/modules/track/services/track.service';
import { TrackDto, TrackResDto } from 'src/modules/track/dto';
import { AdminGuard } from 'src/common/guards';
import { UserService } from 'src/modules/user/services/user.service';
import { UserRole } from 'src/modules/user/entities';
import { FileInterceptor } from '@nestjs/platform-express';
import { MemberService } from 'src/modules/member/services/member.service';
import { OutputUserDto } from 'src/modules/user/dto/output-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@UseInterceptors(ResponseInterceptor)
@Controller('admins')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly trackService: TrackService,
    private readonly userService: UserService,
    private readonly memberService: MemberService,
  ) {}

  @Post('/signup')
  async singup(@Body() dto: CreateAdminDto) {
    return await this.adminService.signup(dto);
  }

  @Get('/verify-email')
  async verifyEmail(@Query() dto: VerifyEamilDto) {
    const result = await this.adminService.verifyEmail(dto.id, dto.token);
    //TODO 채영님 프론트 uri
    if (result) return '성공';
    if (!result) return '실패';
  }

  // track
  //생성
  @Post('/tracks')
  @UseGuards(AdminGuard)
  @Serialize(TrackResDto)
  async createTrack(@Body() dto: TrackDto): Promise<TrackResDto> {
    return await this.trackService.createTrack(dto);
  }

  //users
  //user role 수정
  @Patch('/users/roles/:id')
  @Serialize(OutputUserDto)
  @UseGuards(AdminGuard)
  async updateUserRole(
    @Param('id') userId: string,
    @Body('role') role: UserRole,
  ) {
    return this.userService.updateUserRole(userId, role);
  }

  //user 트랙 수정.
  @Patch('/users/tracks/:id')
  @Serialize(OutputUserDto)
  @UseGuards(AdminGuard)
  async updateUserTrack(@Param('id') id: string, @Body() trackDto: TrackDto) {
    return await this.userService.updateUserTracks(id, trackDto);
  }

  //member
  //racer 등록
  @Post('/members/racers')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    return this.memberService.importUsersFromExcel(file);
  }

  // coach 등록
  @Post('/members/coaches')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importCoaches(@UploadedFile() file: Express.Multer.File) {
    return this.memberService.importCoachesFromExcel(file);
  }

  //project 등록 및 팀 빌딩 생성
  @Post('/teams')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createTeamAndProject(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.createTeamAndProject(file);
  }
}
