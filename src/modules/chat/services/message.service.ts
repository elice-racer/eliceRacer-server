import { HttpStatus, Injectable } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository';
import { ChatRepository } from '../repositories';
import { UserRepository } from 'src/modules/user/repositories';
import { BusinessException } from 'src/exception';
import { Message } from '../entities';
import { User } from 'src/modules/user/entities';
import { Chat } from '../entities/chat.entity';
import { SendMessageDto } from '../dto/send-message.dto';
import { PaginationMessagesDto } from '../dto';
import { ConfigService } from '@nestjs/config';
import { ENV_SERVER_URL_KEY } from 'src/common/const';

@Injectable()
export class MessageService {
  private baseUrl;
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly messageRepo: MessageRepository,
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>(ENV_SERVER_URL_KEY);
  }

  async getMessages(dto: PaginationMessagesDto) {
    const { chatId, pageSize } = dto;
    const messages = await this.messageRepo.getMessages(dto);

    let next: string | null = null;

    if (messages.length > pageSize) {
      const lastMessage = messages[pageSize - 1];
      next = `${this.baseUrl}/api/chats/messages?chatId=${chatId}&pageSize=${pageSize}&lastMessageId=${lastMessage.id}&lastMessageCreatedAt=${lastMessage.createdAt.toISOString()}`;
      messages.pop();
    }

    return { messages, pagination: { next, count: messages.length } };
  }

  async saveMessage(dto: SendMessageDto) {
    const { userId, chatId, content } = dto;
    const chat = await this.chatRepo.findOneBy({ id: chatId });

    if (!chat)
      throw new BusinessException(
        'chat',
        '해당 채팅방이 존재하지 않습니다',
        '해당 채팅방이 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );

    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user)
      throw new BusinessException(
        'user',
        '해당 유저가 존재하지 않습니다',
        '해당 유저가 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );

    return this.createMessage(chat, user, content);
  }

  async createMessage(chat: Chat, user: User, content: string) {
    const message = new Message();

    message.content = content;
    message.user = user;
    message.chat = chat;

    return this.messageRepo.save(message);
  }
}
