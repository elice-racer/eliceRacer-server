import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { JwtAuthGuard } from 'src/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/modules/user/entities';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('tokens')
  async registerToken(@CurrentUser() user: User, @Body('token') token: string) {
    await this.notificationService.saveUserToken(user, token);
  }
}
