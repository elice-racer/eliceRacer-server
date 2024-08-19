import { EntityManager, Repository } from 'typeorm';
import { Chat, ChatType } from '../entities/chat.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from 'src/modules/user/entities';
import { Team } from 'src/modules/team/entities/team.entity';
import { ChatRoomsReqDto } from '../dto/requesets/chat-rooms-req.dto';

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

  async findChatRooms(dto: ChatRoomsReqDto) {
    const { trackName, cardinalNo, round, type } = dto;

    const query = this.repo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.users', 'user')
      .leftJoin('chat.team', 'team')
      .leftJoinAndSelect('team.project', 'project')
      .leftJoinAndSelect('project.track', 'track')
      .orderBy('track.trackName', 'ASC')
      .addOrderBy('track.cardinalNo', 'ASC')
      .addOrderBy('project.round', 'ASC')
      .addOrderBy('team.teamNumber', 'ASC');

    if (trackName !== 'ALL')
      query.andWhere('track.trackName = :trackName', { trackName });

    if (cardinalNo !== 0)
      query.andWhere('track.cardinalNo =:cardinalNo', { cardinalNo });

    if (round !== 0) query.andWhere('project.round = :round', { round });

    if (type !== 'ALL') query.andWhere('chat.type = :type', { type });

    return query.getMany();
  }

  async findPersonalChat(
    userId1: string,
    userId2: string,
  ): Promise<Chat | undefined> {
    return await this.repo
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'user1', 'user1.id = :userId1', { userId1 })
      .innerJoin('chat.users', 'user2', 'user2.id = :userId2', { userId2 })
      .where('chat.type = :type', { type: ChatType.PERSONAL })
      .getOne();
  }

  async createPersonalChat(
    currentUser: User,
    otherUser: User,
    chatName: string,
  ): Promise<Chat> {
    return await this.createChat(
      currentUser,
      [otherUser],
      `${chatName}`,
      ChatType.PERSONAL,
    );
  }

  async createGroupChat(
    currentUser: User,
    users: User[],
    chatName: string,
  ): Promise<Chat> {
    return await this.createChat(currentUser, users, chatName, ChatType.GROUP);
  }

  async createTeamChat(
    currentUser: User,
    users: User[],
    chatName: string,
    team: Team,
  ): Promise<Chat> {
    return await this.createChat(
      currentUser,
      users,
      chatName,
      ChatType.TEAM,
      team,
    );
  }
  private async createChat(
    currentUser: User,
    users: User[],
    chatName: string,
    chatType: ChatType,
    team?: Team,
  ): Promise<Chat> {
    const queryRunner = this.repo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const chat = this.initializeChat(
        currentUser,
        users,
        chatName,
        chatType,
        team,
      );
      const savedChat = await queryRunner.manager.save(chat);

      await queryRunner.commitTransaction();
      return savedChat;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        'Failed to create chat and update team: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private initializeChat(
    currentUser: User,
    users: User[],
    chatName: string,
    chatType: ChatType,
    team?: Team,
  ): Chat {
    const chat = new Chat();
    chat.chatName = chatName;
    chat.users = [...users, currentUser];
    chat.type = chatType;

    if (team) {
      chat.team = team;
    }

    return chat;
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
