import { Module } from '@nestjs/common';
import { NoticeController } from './controllers/notice.controller';
import { NoticeService } from './services/notice.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';
import { NoticeRepository } from './repositories/notice.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  controllers: [NoticeController],
  providers: [NoticeService, NoticeRepository],
  exports: [NoticeService],
})
export class NoticeModule {}
