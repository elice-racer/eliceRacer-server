import { HttpStatus, Injectable } from '@nestjs/common';
import { ChatRepository } from '../repositories';
import {
  CreateChatRoomDto,
  CreateTeamChatDto,
  MemberTeamChatDto,
} from '../dto';
import { TeamRepository } from '../../team/repositories/team.repository';
import { BusinessException } from 'src/exception';
import { UserRepository } from '../../user/repositories';
import { Chat } from '../entities/chat.entity';
import { ChatGateway } from '../chat.gateway';
import { User } from 'src/modules/user/entities';
import { In } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly teamRepo: TeamRepository,
    private readonly userRepo: UserRepository,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getUserChats(userId: string): Promise<Chat[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['chats', 'chats.users'],
    });

    if (!user)
      throw new BusinessException(
        `user`,
        `사용자가 존재하지 않습니다.`,
        `사용자가 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    return user.chats;
  }

  async isMember(dto: MemberTeamChatDto) {
    return this.chatRepo.isMember(dto.chatId, dto.userId);
  }

  async createChatRoom(currentUser: User, dto: CreateChatRoomDto) {
    const users = await this.userRepo.find({ where: { id: In(dto.userIds) } });

    if (users.length! == dto.userIds.length)
      throw new BusinessException(
        'chat',
        '존재하지 않는 유저가 있습니다',
        `존재하지 않는 유저가 있습니다`,
        HttpStatus.NOT_FOUND,
      );

    return this.chatRepo.createChatRoom(currentUser, users, dto.chatName);
  }

  async createTeamChat(currentUser: User, dto: CreateTeamChatDto) {
    const team = await this.teamRepo.findOne({
      where: { id: dto.teamId },
      relations: ['users', 'project'],
    });

    if (!team)
      throw new BusinessException(
        'team',
        '해당 팀이 존재하지 않습니다',
        '해당 팀이 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );

    const chatName = `[${team.project.projectName}] ${team.teamNumber}팀`;

    const chat = await this.chatRepo.createTeamChat(
      chatName,
      team.users,
      currentUser,
    );

    return chat;
  }
}
