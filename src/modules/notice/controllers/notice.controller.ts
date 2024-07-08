import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { NoticeService } from '../services/notice.service';
import {
  OutputNoticeDto,
  PaginationNoticeDto,
  PaginationNoticesByAuthorDto,
} from '../dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor, Serialize } from 'src/interceptors';

@ApiTags('notice')
@Controller('notices')
@UseInterceptors(ResponseInterceptor)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get('/authors')
  @Serialize(OutputNoticeDto)
  async getNoticeByAuthor(@Query() dto: PaginationNoticesByAuthorDto) {
    return await this.noticeService.getNoticesByAuthor(dto);
  }

  @Get('/all')
  @Serialize(OutputNoticeDto)
  async getAllNotice(@Query() dto: PaginationNoticeDto) {
    const { notices, pagination } = await this.noticeService.getAllNotice(dto);

    return { notices, pagination };
  }

  @Get('/:noticeId')
  @Serialize(OutputNoticeDto)
  async getNotice(@Param('noticeId') noticeId: string) {
    return await this.noticeService.getNotice(noticeId);
  }
}
