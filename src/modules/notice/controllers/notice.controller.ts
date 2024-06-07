import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { NoticeService } from '../services/notice.service';
import { OutputNoticeDto, PaginationNoticeDto } from '../dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor, Serialize } from 'src/interceptors';

@ApiTags('notice')
@Controller('notices')
@UseInterceptors(ResponseInterceptor)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get('/noticeId')
  async getNotice() {}

  @Get('/all')
  @Serialize(OutputNoticeDto)
  async getAllNotice(@Query() dto: PaginationNoticeDto) {
    return await this.noticeService.getAllNotice(dto);
  }
}
