import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, updateReqDto } from '../dto';
import { CurrentUser } from 'src/common/decorators';
import { User } from '../entities';
import { AdminGuard, JwtAuthGuard } from 'src/common/guards';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    await this.userService.handleSignUp(createUserDto);
  }

  @Post('/:id')
  @UseGuards(JwtAuthGuard)
  async updateMypage(@Body() dto: updateReqDto, @CurrentUser() user: User) {
    console.log(dto, user);
  }

  @Patch('/tracks/:id')
  @UseGuards(AdminGuard)
  async updateUserTrack(
    @Param('id') id: string,
    @Body('trackName') trackNames: string[],
  ) {
    const result = await this.userService.updateUserTracks(id, trackNames);
    console.log(result);
  }
}
