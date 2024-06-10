import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Message } from '../entities';
import { PaginationMessagesDto } from '../dto';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async getMessages(dto: PaginationMessagesDto) {
    const { chatId, pageSize, lastMessageId, lastMessageCreatedAt } = dto;
    const query = this.repo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.chat', 'chat')
      .where('chat.id = :chatId', { chatId })
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'ASC');

    if (lastMessageCreatedAt && lastMessageId) {
      query.andWhere(
        `(message.createdAt < :lastMessageCreatedAt) 
      OR (message.createdAt = :lastMessageCreatedAt AND message.id > :lastMessageId)`,
        {
          lastMessageCreatedAt,
          lastMessageId,
        },
      );
    }

    return query.limit(pageSize + 1).getMany();
  }
}
