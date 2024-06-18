import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken } from './entities/device-token.entity';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { DeviceTokenRepository } from './repositories/device.-token.repository';
import { UserModule } from '../user/user.module';
import { OfficehourModule } from '../officehour/officehour.module';
import { FirebaseModule } from 'core/firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceToken]),
    UserModule,
    OfficehourModule,
    FirebaseModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, DeviceTokenRepository],
})
export class NotificationModule {}
