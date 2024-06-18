import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ENV_FIREBASE_CLIENT_EMAIL_KEY,
  ENV_FIREBASE_PRIVATE_KEY,
  ENV_FIREBASE_PROJECT_ID_KEY,
  ENV_FIREBASE_TYPE_KEY,
} from 'src/common/const';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [ConfigModule],
  providers: [
    FirebaseService,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: async (configService: ConfigService) => {
        const firebaseParams = {
          type: configService.get<string>(ENV_FIREBASE_TYPE_KEY),
          projectId: configService.get<string>(ENV_FIREBASE_PROJECT_ID_KEY),
          privateKey: configService
            .get<string>(ENV_FIREBASE_PRIVATE_KEY)
            .replace(/\\n/g, '\n'),
          clientEmail: configService.get<string>(ENV_FIREBASE_CLIENT_EMAIL_KEY),
        };
        admin.initializeApp({
          credential: admin.credential.cert(firebaseParams),
        });
        return admin.messaging();
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FIREBASE_ADMIN', FirebaseService],
})
export class FirebaseModule {}
