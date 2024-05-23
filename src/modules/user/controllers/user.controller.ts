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
import { CreateUserDto, CurrentResDto, updateReqDto } from '../dto';
import { CurrentUser } from 'src/common/decorators';
import { User } from '../entities';
import { AdminGuard, JwtAuthGuard } from 'src/common/guards';
import { ResponseInterceptor } from 'src/interceptors';
import { Serialize } from 'src/interceptors';
import { OutputUserDto } from '../dto/output-user.dto';
import { TrackDto } from 'src/modules/track/dto';

@UseInterceptors(ResponseInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Patch('/chang')
  async chang(@Body('username') username: string) {
    return await this.userService.chang(username);
  }
  @Get('/tracks/all')
  @UseGuards(JwtAuthGuard)
  @Serialize(OutputUserDto)
  async getAllUsersByTrack(
    @Query('track') track: string,
    @Query('cardinal') cardinal: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    const trackDto: TrackDto = {
      trackName: track,
      cardinalNo: cardinal,
    };
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return await this.userService.getAllUsersByTrack(
      trackDto,
      pageNumber,
      pageSizeNumber,
    );
  }

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  async allUsers(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);

    return await this.userService.getAllUsers(pageNumber, pageSizeNumber);
  }

  @Get('/current')
  @UseGuards(JwtAuthGuard)
  @Serialize(CurrentResDto)
  async currentUser(@CurrentUser() user: User): Promise<CurrentResDto> {
    return user;
  }

  @Patch('/signup')
  @Serialize(OutputUserDto)
  async signup(@Body() createUserDto: CreateUserDto) {
    await this.userService.handleSignUp(createUserDto);
  }

  @Patch('/tracks/:id')
  @UseGuards(AdminGuard)
  async updateUserTrack(@Param('id') id: string, @Body() trackDto: TrackDto) {
    return await this.userService.updateUserTracks(id, trackDto);
  }
  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  async updateMypage(@Body() dto: updateReqDto, @CurrentUser() user: User) {
    return await this.userService.updateMypage(user.id, dto);
  }
}
