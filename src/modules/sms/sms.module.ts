import { Module } from '@nestjs/common';
import { SmsService } from './services/SmsService';
import { SmsController } from './sms.controller';

@Module({
  providers: [SmsService],
  controllers: [SmsController],
})
export class SmsModule {}
