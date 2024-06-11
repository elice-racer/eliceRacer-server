import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ChatRoomResDto,
  CreateChatRoomDto,
  PaginationMessagesDto,
} from '../dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import { MessageService } from '../services/message.service';
import { ResponseInterceptor, Serialize } from 'src/interceptors';
import { JwtAuthGuard } from 'src/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/modules/user/entities';

@ApiTags('chat')
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @Get('/rooms/all')
  @Serialize(ChatRoomResDto)
  async getChatRooms(@CurrentUser() user: User) {
    return await this.chatService.getUserChats(user.id);
  }

  @Get('messages')
  async getMessages(@Query() dto: PaginationMessagesDto) {
    return await this.messageService.getMessages(dto);
  }

  @Post('')
  async createChatRoom(
    @CurrentUser() currentUser: User,
    @Body() dto: CreateChatRoomDto,
  ) {
    return await this.chatService.createChatRoom(currentUser, dto);
  }
}
