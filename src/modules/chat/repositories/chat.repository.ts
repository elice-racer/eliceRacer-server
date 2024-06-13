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
  ): Promise<Chat> {
    // 시작 전 트랜잭션 시작
    const queryRunner = this.repo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const chat = new Chat();
      chat.chatName = chatName;
      chat.users = [...users, currentUser];

      if (team) {
        chat.team = team;
        // 팀 채팅 생성 상태 업데이트
        team.isChatCreated = true;

        await queryRunner.manager.save(team);
      }

      const savedChat = await queryRunner.manager.save(chat);

      // 모든 작업이 완료되면 트랜잭션 커밋
      await queryRunner.commitTransaction();
      return savedChat;
    } catch (error) {
      // 오류 발생 시 롤백
      await queryRunner.rollbackTransaction();
      throw new Error(
        'Failed to create chat and update team: ' + error.message,
      );
    } finally {
      // 트랜잭션 종료 후 연결 해제
      await queryRunner.release();
    }
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
