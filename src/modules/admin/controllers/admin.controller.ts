import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { User, UserRole } from 'src/modules/user/entities';
import { FileInterceptor } from '@nestjs/platform-express';
import { MemberService } from 'src/modules/member/services/member.service';
import { OutputUserDto } from 'src/modules/user/dto/output-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateNoticeDto,
  OutputNoticeDto,
  UpdateNoticeDto,
} from 'src/modules/notice/dto';
import { NoticeService } from 'src/modules/notice/services/notice.service';
import { CurrentUser } from 'src/common/decorators';
import { TeamService } from 'src/modules/team/services/team.service';
import { OutputTeamDto, UpdateTeamMemberReqDto } from 'src/modules/team/dto';
import { ChatService } from 'src/modules/chat/services/chat.service';
import { CreateTeamChatDto } from 'src/modules/chat/dto';
import { OutputProjectDto } from 'src/modules/project/dto/output-project.dto';
import { UpdateProjectReqDto } from 'src/modules/project/dto';
import { ProjectService } from 'src/modules/project/services/project.service';

@ApiTags('admin')
@UseInterceptors(ResponseInterceptor)
@Controller('admins')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly trackService: TrackService,
    private readonly userService: UserService,
    private readonly memberService: MemberService,
    private readonly noticeService: NoticeService,
    private readonly teamService: TeamService,
    private readonly chatService: ChatService,
    private readonly projectService: ProjectService,
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
  @Patch('/users/roles/:userId')
  @Serialize(OutputUserDto)
  @UseGuards(AdminGuard)
  async updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: UserRole,
  ) {
    return this.userService.updateUserRole(userId, role);
  }

  //user 트랙 수정.
  @Patch('/users/tracks/:userId')
  @Serialize(OutputUserDto)
  @UseGuards(AdminGuard)
  async updateUserTrack(
    @Param('userId') userId: string,
    @Body() trackDto: TrackDto,
  ) {
    return await this.userService.updateUserTracks(userId, trackDto);
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

  @Delete('/teams/:teamId')
  @UseGuards(AdminGuard)
  async deleteTeam(@Param('teamId') teamId: string) {
    await this.teamService.deleteTeam(teamId);
  }

  @Patch('/teams/:teamId')
  @Serialize(OutputTeamDto)
  async updateTeamMember(
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamMemberReqDto,
  ) {
    return await this.teamService.updateTeamMember(teamId, dto);
  }

  // notice  공지 등록 및 업데이트
  @Post('/notices')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputNoticeDto)
  async createNotice(@CurrentUser() user: User, @Body() dto: CreateNoticeDto) {
    return await this.noticeService.createNotice(user, dto);
  }

  @Put('/notices/:noticeId')
  @UseGuards(AdminGuard)
  @Serialize(OutputNoticeDto)
  @ApiBearerAuth('access-token')
  async updateNotice(
    @CurrentUser() user: User,
    @Param('noticeId') noticeId: string,
    @Body() dto: UpdateNoticeDto,
  ) {
    return await this.noticeService.updateNotice(user.id, noticeId, dto);
  }

  @Delete('/notices/:noticeId')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  async deleteNotice(
    @CurrentUser() user: User,
    @Param('noticeId') noticeId: string,
  ) {
    return await this.noticeService.deleteNotice(user.id, noticeId);
  }

  //project
  @Put('/:projectId')
  @UseGuards(AdminGuard)
  @Serialize(OutputProjectDto)
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectReqDto,
  ) {
    return this.projectService.updateProject(projectId, dto);
  }
  //chat
  //팀 채팅방 생성
  @UseGuards(AdminGuard)
  @Post('/chats/teams')
  async createTeamChat(
    @CurrentUser() currentUser: User,
    @Body() dto: CreateTeamChatDto,
  ) {
    return await this.chatService.createTeamChat(currentUser, dto);
  }
}
