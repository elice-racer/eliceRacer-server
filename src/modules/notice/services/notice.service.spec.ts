import { Test, TestingModule } from '@nestjs/testing';
import { NoticeService } from './notice.service';
import { NoticeRepository } from '../repositories/notice.repository';

describe('NoticeService', () => {
  let service: NoticeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeService, NoticeRepository],
    }).compile();

    service = module.get<NoticeService>(NoticeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
