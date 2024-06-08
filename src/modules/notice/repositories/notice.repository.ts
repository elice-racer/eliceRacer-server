import { EntityManager, Repository } from 'typeorm';
import { Notice } from '../entities/notice.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { CreateNoticeDto } from '../dto';
import { User } from 'src/modules/user/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NoticeRepository extends Repository<Notice> {
  constructor(
    @InjectRepository(Notice)
    private readonly repo: Repository<Notice>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createNotice(
    user: User,
    dto: CreateNoticeDto,
  ): Promise<Notice> | undefined {
    const notice = new Notice();

    notice.title = dto.title;
    notice.content = dto.content;
    notice.user = user;

    return this.repo.save(notice);
  }

  async findAllNotice(page: number, pageSize: number): Promise<Notice[]> {
    return this.repo
      .createQueryBuilder('notice')
      .leftJoinAndSelect('notice.user', 'user')
      .orderBy('notice.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  }
}
