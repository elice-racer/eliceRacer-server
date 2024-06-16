import { HttpStatus, Injectable } from '@nestjs/common';
import { ChatRepository } from '../repositories';
import { CreateChatRoomDto, CreateTeamChatDto } from '../dto';
import { TeamRepository } from '../../team/repositories/team.repository';
import { BusinessException } from 'src/exception';
import { UserRepository } from '../../user/repositories';
import { Chat, ChatType } from '../entities/chat.entity';
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

  async getChat(chatId: string) {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['team', 'users'],
    });

    if (!chat)
      throw new BusinessException(
        `chat`,
        `채팅방이 존재하지 않습니다.`,
        `채팅방이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    return chat;
  }

  async getChatOfCurrentUser(userId: string): Promise<Chat[]> {
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

  //TODO chatRoom 생성하는 건 하나만 두고
  //TODO team일경우에는 호출하는 방식으로 수정
  async createChat(currentUser: User, dto: CreateChatRoomDto) {
    const users = await this.userRepo.find({ where: { id: In(dto.userIds) } });

    if (users.length !== dto.userIds.length)
      throw new BusinessException(
        'chat',
        '존재하지 않는 유저가 있습니다',
        `존재하지 않는 유저가 있습니다`,
        HttpStatus.NOT_FOUND,
      );

    if (users.length === 1) {
      const existingChat = await this.chatRepo.findPersonalChat(
        currentUser.id,
        users[0].id,
      );

      if (existingChat)
        throw new BusinessException(
          'chat',
          `해당 채팅방이 이미 존재합니다 ${existingChat.id}`,
          `해당 채팅방이 이미 존재합니다 ${existingChat.id}`,
          HttpStatus.CONFLICT,
        );
      return this.chatRepo.createPersonalChat(
        currentUser,
        users[0],
        dto.chatName,
      );
    }

    return this.chatRepo.createGroupChat(currentUser, users, dto.chatName);
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

    if (team.isChatCreated)
      throw new BusinessException(
        'team',
        '해당 팀은 이미 채팅방이 존재합니다',
        '해당 팀은 이미 채팅방이 존재합니다',
        HttpStatus.CONFLICT,
      );

    const chatName = `[${team.project.projectName}] ${team.teamNumber}팀`;

    const chat = await this.chatRepo.createTeamChat(
      currentUser,
      team.users,
      chatName,
      team,
    );

    return chat;
  }

  async removeUserFromChat(chatId: string, currentUser: User) {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['users'],
    });

    if (!chat)
      throw new BusinessException(
        `chat`,
        `채팅방이 존재하지 않습니다.`,
        `채팅방이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    // 확인: 현재 유저가 채팅방 멤버인지
    const isMember = chat.users.some((user) => user.id === currentUser.id);
    if (!isMember) {
      throw new BusinessException(
        'team',
        '해당 작업을 수행할 권한이 없습니다',
        '채팅방에 존재하지 않는 회원입니다',
        HttpStatus.FORBIDDEN,
      );
    }

    // 유저 제거
    chat.users = chat.users.filter((user) => user.id !== currentUser.id);
    await this.chatRepo.save(chat);
  }

  async addUsersToChat(
    chatId: string,
    newUserIds: string[],
    currentUser: User,
  ) {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['users'],
    });

    if (!chat)
      throw new BusinessException(
        `chat`,
        `채팅방이 존재하지 않습니다.`,
        `채팅방이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    const isMember = chat.users.some((user) => user.id === currentUser.id);
    if (!isMember) {
      throw new BusinessException(
        'team',
        '해당 작업을 수행할 권한이 없습니다',
        '채팅방에 참여한 회원만 새로운 회원을 추가할 수 있습니다',
        HttpStatus.FORBIDDEN,
      );
    }

    if (chat.type === ChatType.PERSONAL) {
    }

    const newUsers = await this.userRepo.findBy({
      id: In(newUserIds),
    });

    const validNewUsers = newUsers.filter(
      (user) => !chat.users.some((u) => u.id === user.id),
    );

    chat.users = [...chat.users, ...validNewUsers];
    await this.chatRepo.save(chat);
  }
}
