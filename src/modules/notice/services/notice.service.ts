import { HttpStatus, Injectable } from '@nestjs/common';
import { NoticeRepository } from '../repositories/notice.repository';
import {
  CreateNoticeDto,
  PaginationNoticeDto,
  PaginationNoticesByAuthorDto,
  UpdateNoticeReqDto,
} from '../dto';
import { BusinessException } from 'src/exception';
import { User } from 'src/modules/user/entities';

@Injectable()
export class NoticeService {
  constructor(private readonly noticeRepo: NoticeRepository) {}

  async createNotice(user: User, dto: CreateNoticeDto) {
    return await this.noticeRepo.createNotice(user, dto);
  }

  async getNotice(noticeId: string) {
    const notice = await this.noticeRepo.findOne({
      where: { id: noticeId },
      relations: ['user'],
    });

    if (!notice)
      throw new BusinessException(
        'notice',
        `해당 공지가 존재하지 않습니다`,
        `해당 공지가 존재하지 않습니다`,
        HttpStatus.NOT_FOUND,
      );

    return notice;
  }

  async getNoticesByAuthor(dto: PaginationNoticesByAuthorDto) {
    const [notices, total] = await this.noticeRepo.findNoticeByAuthor(dto);
    return { notices, pagination: { count: notices.length, total } };
  }

  async getAllNotice(dto: PaginationNoticeDto) {
    const { page, pageSize } = dto;

    const [notices, total] = await this.noticeRepo.findAllNotices(
      page,
      pageSize,
    );
    return { notices, pagination: { count: notices.length, total } };
  }

  async updateNotice(
    userId: string,
    noticeId: string,
    dto: UpdateNoticeReqDto,
  ) {
    const notice = await this.noticeRepo.findOne({
      where: { id: noticeId },
      relations: ['user'],
    });

    if (!notice)
      throw new BusinessException(
        'notice',
        `해당 공지가 존재하지 않습니다`,
        `해당 공지가 존재하지 않습니다`,
        HttpStatus.NOT_FOUND,
      );

    if (notice.user.id != userId)
      throw new BusinessException(
        'notice',
        `작성자가 아니면 글을 수정할 수 없습니다`,
        `작성자가 아니면 글을 수정할 수 없습니다`,
        HttpStatus.FORBIDDEN,
      );

    Object.assign(notice, dto);

    return this.noticeRepo.save(notice);
  }

  async deleteNotice(userId: string, noticeId: string) {
    const notice = await this.noticeRepo.findOne({
      where: { id: noticeId },
      relations: ['user'],
    });
    if (!notice)
      throw new BusinessException(
        'notice',
        `해당 공지가 존재하지 않습니다`,
        `해당 공지가 존재하지 않습니다`,
        HttpStatus.NOT_FOUND,
      );

    if (notice.user.id != userId)
      throw new BusinessException(
        'notice',
        `작성자가 아니면 글을 삭제할 수 없습니다`,
        `작성자가 아니면 글을 삭제할 수 없습니다`,
        HttpStatus.FORBIDDEN,
      );

    this.noticeRepo.remove(notice);
  }
}
