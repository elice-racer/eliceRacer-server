import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateUserDto,
  CurrentResDto,
  DetailUserResDto,
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

@UseInterceptors(ResponseInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('/chang')
  async chang(@Body('username') username: string) {
    return await this.userService.chang(username);
  }

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  @Serialize(OutputUserDto)
  async getAllRacers(@Query() dto: PaginationRacersDto) {
    return await this.userService.getAllRacres(dto);
  }
  @Get('/tracks/all')
  @UseGuards(JwtAuthGuard)
  @Serialize(OutputUserDto)
  async getAllRacersByTrack(@Query() dto: PaginationRacersByTrackDto) {
    const { users, pagination } =
      await this.userService.getAllRacersByTrack(dto);

    return { users, pagination };
  }

  @Get('/tracks-cardinal/all')
  @UseGuards(JwtAuthGuard)
  @Serialize(OutputUserDto)
  async getAllRacresByCardinalNo(@Query() dto: PaginationRacersByCardinalDto) {
    return await this.userService.getAllRacersByCardinalNo(dto);
  }

  @Get('/current')
  @UseGuards(JwtAuthGuard)
  @Serialize(CurrentResDto)
  async currentUser(@CurrentUser() user: User): Promise<CurrentResDto> {
    return user;
  }

  @Patch('/signup')
  @Serialize(OutputUserDto)
  async signup(@Body() dto: CreateUserDto) {
    await this.userService.handleSignUp(dto);
  }

  @Patch('/mypage')
  @UseGuards(JwtAuthGuard)
  @Serialize(DetailUserResDto)
  async updateMypage(@Body() dto: updateReqDto, @CurrentUser() user: User) {
    return await this.userService.updateMypage(user.id, dto);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @Serialize(DetailUserResDto)
  async getUser(@Param('id') id: string) {
    return await this.userService.getUser(id);
  }
}
