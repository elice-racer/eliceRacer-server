import { EntityManager, Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from 'src/modules/user/entities';

@Injectable()
export class ChatRepository extends Repository<Chat> {
  constructor(
    @InjectRepository(Chat)
    private readonly repo: Repository<Chat>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  //TODO 삭제해도 될 듯
  async createTeamChat(chatName: string, users: User[], currentUser: User) {
    const chat = new Chat();

    chat.chatName = chatName;
    chat.users = [...users, currentUser];

    return this.repo.save(chat);
  }

  async createChatRoom(currentUser: User, users: User[], chatName: string) {
    const chat = new Chat();

    chat.chatName = chatName;
    chat.users = [...users, currentUser];

    return this.repo.save(chat);
  }

  async isMember(chatId: string, userId: string): Promise<boolean> {
    const exists = await this.repo
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'user')
      .where('chat.id = :chatId', { chatId })
      .andWhere('user.id = :userId', { userId })
      .getCount();

    return exists > 0;
  }
}
