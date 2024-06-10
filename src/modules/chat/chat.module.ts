import { Module } from '@nestjs/common';
import { ChatController } from './controllers/chat.controller';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatRepository } from './repositories';
import { TeamModule } from '../team/team.module';
import { UserModule } from '../user/user.module';
import { Message } from './entities';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';
import { MessageRepository } from './repositories/message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message]), TeamModule, UserModule],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    ChatRepository,
    MessageService,
    MessageRepository,
  ],
  exports: [ChatService],
})
export class ChatModule {}
