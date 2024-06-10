import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateUserDto,
  DetailUserResDto,
  PaginationCoachesDto,
  PaginationMembersDto,
  PaginationRacersByCardinalDto,
  PaginationRacersByTrackDto,
  PaginationRacersDto,
  updateReqDto,
} from '../dto';
import { CurrentUser } from 'src/common/decorators';
import { User } from '../entities';
import { JwtAuthGuard } from 'src/common/guards';
import { ResponseInterceptor } from 'src/interceptors';
import { Serialize } from 'src/interceptors';
import { OutputUserDto } from '../dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MiniProfileDto } from '../dto/mini-profile.dto';
import { SkillService } from '../services/skill.service';

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

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputUserDto)
  async getAllRacers(@Query() dto: PaginationRacersDto) {
    return await this.userService.getAllRacres(dto);
  }

  @Get('/tracks/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputUserDto)
  async getAllRacersByTrack(@Query() dto: PaginationRacersByTrackDto) {
    const { users, pagination } =
      await this.userService.getAllRacersByTrack(dto);

    return { users, pagination };
  }

  @Get('/cardinals/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputUserDto)
  async getAllRacresByCardinalNo(@Query() dto: PaginationRacersByCardinalDto) {
    return await this.userService.getAllRacersByCardinalNo(dto);
  }

  @Get('/coaches/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputUserDto)
  async getAllCoaches(@Query() dto: PaginationCoachesDto) {
    return await this.getAllCoaches(dto);
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
  async updateMypage(@Body() dto: updateReqDto, @CurrentUser() user: User) {
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
  async getMiniProfile(@Param('userId') userId: string) {
    return await this.userService.getUser(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputUserDto)
  async getProjectParticipants(
    @CurrentUser() user: User,
    @Query() dto: PaginationMembersDto,
  ) {
    return await this.userService.getProjectParticipants(user.id, dto);
  }

  // @Get()
  // async searchUser(@Query('search') search: string) {}
  @Get('/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Serialize(OutputUserDto)
  async getUser(@Param('userId') userId: string) {
    return await this.userService.getUser(userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async deleteUser(@CurrentUser() user: User) {
    return await this.userService.deleteUser(user.id);
  }
}
