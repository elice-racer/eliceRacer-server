import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateUserDto,
  DetailUserResDto,
  PaginationAllUsersDto,
  PaginationParticipantsDto,
  updateUserReqDto,
} from '../dto';
import { CurrentUser } from 'src/common/decorators';
import { User } from '../entities';
import { JwtAuthGuard } from 'src/common/guards';
import { ResponseInterceptor } from 'src/interceptors';
import { Serialize } from 'src/interceptors';
import { OutputUserDto } from '../dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MiniProfileDto } from '../dto/responses/mini-profile.dto';
import { SkillService } from '../services/skill.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@UseInterceptors(ResponseInterceptor)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly skillService: SkillService,
  ) {}

  @Patch('/chang')
  async chang(@Body('identifier') identifier: string) {
    return await this.userService.chang(identifier);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputUserDto)
  async getAllUsers(
    @CurrentUser() user: User,
    @Query() dto: PaginationAllUsersDto,
  ) {
    const { users, pagination } = await this.userService.getAllUsers(user, dto);
    return { users, pagination };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputUserDto)
  async searchUsers(@Query('realName') search: string) {
    return await this.userService.searchUsers(search);
  }

  @Get('/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(DetailUserResDto)
  async currentUser(@CurrentUser() user: User) {
    return await this.userService.getUser(user.id);
  }

  @Patch('/signup')
  async signup(@Body() dto: CreateUserDto) {
    await this.userService.handleSignUp(dto);
  }

  @Patch('/mypage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(DetailUserResDto)
  async updateMypage(@Body() dto: updateUserReqDto, @CurrentUser() user: User) {
    return await this.userService.updateMypage(user.id, dto);
  }

  @Get('/mypage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(DetailUserResDto)
  async getMyPage(@CurrentUser() user: User) {
    return await this.userService.getUser(user.id);
  }

  @Put('/skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async updateSkill(
    @CurrentUser() user: User,
    @Body('skills') skills: string[],
  ) {
    return await this.userService.updateSkills(user.id, skills);
  }

  @Get('/skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async searchSkill(@Query('search') search: string) {
    return await this.skillService.searchSkills(search);
  }

  @Get('/miniprofiles/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(MiniProfileDto)
  async getMiniProfile(@Param('userId') userId: string): Promise<User> {
    return await this.userService.getUser(userId);
  }

  @Get('/participants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputUserDto)
  async getProjectParticipants(
    @CurrentUser() user: User,
    @Query() dto: PaginationParticipantsDto,
  ) {
    //TODO pagination return으로 수정

    return await this.userService.getProjectParticipants(user.id, dto);
  }

  @Get('/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(DetailUserResDto)
  async getUser(@Param('userId') userId: string): Promise<User> {
    return await this.userService.getUser(userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async deleteUser(@CurrentUser() user: User) {
    return await this.userService.deleteUser(user.id);
  }

  @Put('/profileImages')
  @UseGuards(JwtAuthGuard)
  @Serialize(OutputUserDto)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return await this.userService.uploadProfileImage(file, user);
  }
}
