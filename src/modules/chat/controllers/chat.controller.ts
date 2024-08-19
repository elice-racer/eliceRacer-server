import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { MessageResDto } from '../dto/message-res.dto';
import { CreateChatResDto } from '../dto/create-chat-res.dto';

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
    return await this.chatService.getChatOfCurrentUser(user.id);
  }

  @Get('messages')
  @Serialize(MessageResDto)
  async getMessages(@Query() dto: PaginationMessagesDto) {
    return await this.messageService.getMessages(dto);
  }

  @Post('')
  @Serialize(CreateChatResDto)
  async createChat(
    @CurrentUser() currentUser: User,
    @Body() dto: CreateChatRoomDto,
  ) {
    return await this.chatService.createChat(currentUser, dto);
  }

  @Get('/teams/:teamId')
  @Serialize(ChatRoomResDto)
  async getTeamChat(@Param('teamId') teamId: string) {
    return await this.chatService.getChatByTeamId(teamId);
  }

  @Get('/:chatId')
  @Serialize(CreateChatResDto)
  async getChatRoom(@Param('chatId') chatId: string) {
    return await this.chatService.getChat(chatId);
  }

  @Post('/users/:chatId')
  async addUsers(
    @Param('chatId') chatId: string,
    @Body('userIds') userIds: string[],
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.chatService.addUsersToChat(chatId, userIds, currentUser);
  }

  @Delete('/:chatId')
  async removeCurrentUserFromChat(
    @CurrentUser() user: User,
    @Param('chatId') chatId: string,
  ) {
    return await this.chatService.removeUserFromChat(chatId, user);
  }
}
