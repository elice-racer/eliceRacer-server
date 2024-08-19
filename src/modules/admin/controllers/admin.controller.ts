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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateAdminReqDto, VerifyEamilReqDto } from '../dto';
import { ResponseInterceptor, Serialize } from 'src/interceptors';
import { TrackService } from 'src/modules/track/services/track.service';
import { OutputTrackDto, TrackDto } from 'src/modules/track/dto';
import { AdminGuard } from 'src/common/guards';
import { UserService } from 'src/modules/user/services/user.service';
import { User, UserRole } from 'src/modules/user/entities';
import { FileInterceptor } from '@nestjs/platform-express';
import { MemberService } from 'src/modules/member/services/member.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateNoticeDto,
  OutputNoticeDto,
  UpdateNoticeReqDto,
} from 'src/modules/notice/dto';
import { NoticeService } from 'src/modules/notice/services/notice.service';
import { CurrentUser } from 'src/common/decorators';
import { TeamService } from 'src/modules/team/services/team.service';
import { OutputTeamDto } from 'src/modules/team/dto';
import { ChatService } from 'src/modules/chat/services/chat.service';
import { CreateTeamChatDto } from 'src/modules/chat/dto';
import { OutputProjectDto } from 'src/modules/project/dto/output-project.dto';
import { UpdateProjectReqDto } from 'src/modules/project/dto';
import { ProjectService } from 'src/modules/project/services/project.service';
import { OfficehourService } from 'src/modules/officehour/services/officehour.service';
import { CreateChatResDto } from 'src/modules/chat/dto/responses/create-chat-res.dto';
import { Response } from 'express';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { DetailUserResDto, OutputUserDto } from 'src/modules/user/dto';
import { ChatRoomsReqDto } from 'src/modules/chat/dto/requesets/chat-rooms-req.dto';
import { Track } from 'src/modules/track/entities';
import { UserWithPhoneResDto } from 'src/modules/user/dto/responses/user-with-phone-res.dto';

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
    private readonly officehoureService: OfficehourService,
  ) {}

  @ApiOperation({
    summary: '새로운 관리자 등록',
  })
  @Post('/signup')
  @ApiBody({ type: CreateAdminReqDto })
  async singup(@Body() dto: CreateAdminReqDto): Promise<void> {
    return await this.adminService.signup(dto);
  }

  @ApiOperation({ summary: '관리자 이메일 검증' })
  @Get('/verify-email')
  async verifyEmail(
    @Res() res: Response,
    @Query() dto: VerifyEamilReqDto,
  ): Promise<void> {
    const result = await this.adminService.verifyEmail(dto.id, dto.token);
    if (result) res.redirect('https://elicerracer.store/auth/success-auth');
    if (!result) res.redirect('https://elicerracer.store/auth/fail');
  }

  // track
  @ApiOperation({ summary: '트랙 생성' })
  @Post('/tracks')
  @ApiBearerAuth('access-token')
  @UseGuards(AdminGuard)
  @Serialize(OutputTrackDto)
  async createTrack(@Body() dto: TrackDto): Promise<Track> {
    return await this.trackService.createTrack(dto);
  }

  //users
  //TODO 여기서 부터해야함
  @ApiOperation({ summary: '유저 상세 정보 가져오기' })
  @Get('/users/:userId')
  @UseGuards(AdminGuard)
  @Serialize(UserWithPhoneResDto)
  async getUserByUserId(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  //user role 수정
  @ApiOperation({ summary: '레이저 역할 수정' })
  @Patch('/users/roles/:userId')
  @Serialize(OutputUserDto)
  @UseGuards(AdminGuard)
  @ApiBody({})
  async updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: UserRole,
  ) {
    return this.userService.updateUserRole(userId, role);
  }

  //user 트랙 수정.
  @ApiOperation({ summary: '레이저 트랙 수정' })
  @Patch('/users/tracks/:userId')
  @Serialize(DetailUserResDto)
  @UseGuards(AdminGuard)
  async updateUserTrack(
    @Param('userId') userId: string,
    @Body() trackDto: TrackDto,
  ) {
    return await this.userService.updateUserTracks(userId, trackDto);
  }

  //member
  //racer 등록
  //TODO 멤버 등록 인원등에 대해서 알림 띄우기
  @ApiOperation({ summary: '레이서 등록' })
  @Post('/members/racers')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    return this.memberService.importUsersFromExcel(file);
  }

  // coach 등록 //TODO 멤버 등록 인원등에 대해서 알림 띄우기
  @ApiOperation({ summary: '코치 등록' })
  @Post('/members/coaches')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importCoaches(@UploadedFile() file: Express.Multer.File) {
    return this.memberService.importCoachesFromExcel(file);
  }

  //project 등록 및 팀 빌딩 생성
  @ApiOperation({ summary: '팀 빌딩' })
  @Post('/teams')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createTeamAndProject(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.createTeamAndProject(file);
  }

  @Delete('/teams/:teamId')
  @UseGuards(AdminGuard)
  async deleteTeam(@Param('teamId') teamId: string): Promise<void> {
    await this.teamService.deleteTeam(teamId);
  }

  @Put('/teams/:teamId')
  @Serialize(OutputTeamDto)
  async updateTeamMember(
    @Param('teamId') teamId: string,
    @Body('userIds') userIds: string[],
  ): Promise<OutputTeamDto> {
    return await this.teamService.updateTeamMember(teamId, userIds);
  }

  // notice  공지 등록 및 업데이트
  @Post('/notices')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputNoticeDto)
  async createNotice(
    @CurrentUser() user: User,
    @Body() dto: CreateNoticeDto,
  ): Promise<OutputNoticeDto> {
    return await this.noticeService.createNotice(user, dto);
  }

  @Put('/notices/:noticeId')
  @UseGuards(AdminGuard)
  @Serialize(OutputNoticeDto)
  @ApiBearerAuth('access-token')
  async updateNotice(
    @CurrentUser() user: User,
    @Param('noticeId') noticeId: string,
    @Body() dto: UpdateNoticeReqDto,
  ): Promise<OutputNoticeDto> {
    return await this.noticeService.updateNotice(user.id, noticeId, dto);
  }

  @Delete('/notices/:noticeId')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  async deleteNotice(
    @CurrentUser() user: User,
    @Param('noticeId') noticeId: string,
  ): Promise<void> {
    return await this.noticeService.deleteNotice(user.id, noticeId);
  }

  //project
  @Put('/projects/:projectId')
  @UseGuards(AdminGuard)
  @Serialize(OutputProjectDto)
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectReqDto,
  ) {
    return this.projectService.updateProject(projectId, dto);
  }
  //chat
  @Get('/chats')
  //TODO userDTO 추가해야함
  // @Serialize()
  async getChatRooms(@Query() dto: ChatRoomsReqDto) {
    return await this.chatService.getChatRooms(dto);
  }

  //팀 채팅방 생성
  @Post('/chats/teams')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @Serialize(CreateChatResDto)
  async createTeamChat(
    @CurrentUser() currentUser: User,
    @Body() dto: CreateTeamChatDto,
  ): Promise<Chat> {
    return await this.chatService.createTeamChat(currentUser, dto);
  }

  @Post('/officehours/:projectId')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importOfficehours(
    @UploadedFile() file: Express.Multer.File,
    @Param('projectId') projectId: string,
  ) {
    return await this.officehoureService.importOfficehoursFromExcel(
      file,
      projectId,
    );
  }

  //TODO return void
  @Delete('/officehours/:projectId')
  @UseGuards(AdminGuard)
  async deleteOfficehourByProjectId(@Param('projectId') projectId: string) {
    return await this.officehoureService.deleteOfficehourByProjectId(projectId);
  }
}
