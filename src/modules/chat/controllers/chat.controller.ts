import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { PaginationMessagesDto } from '../dto';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import { MessageService } from '../services/message.service';
import { ResponseInterceptor } from 'src/interceptors';

@ApiTags('chat')
@UseInterceptors(ResponseInterceptor)
@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @Get('messages')
  async getMessages(@Query() dto: PaginationMessagesDto) {
    return await this.messageService.getMessages(dto);
  }
}
