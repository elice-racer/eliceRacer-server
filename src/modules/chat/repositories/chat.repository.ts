import { EntityManager, Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from 'src/modules/user/entities';
import { Team } from 'src/modules/team/entities/team.entity';

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

  async createChat(
    currentUser: User,
    users: User[],
    chatName: string,
    team?: Team,
  ) {
    const chat = new Chat();

    chat.chatName = chatName;
    chat.users = [...users, currentUser];
    if (team) {
      chat.team = team;
    }

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
