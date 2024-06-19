import { FirebaseService } from 'core/firebase/firebase.service';
import { OfficehourRepository } from '../../officehour/repositories/officehour.repository';
import { DeviceTokenRepository } from '../repositories/device.-token.repository';
import { UserRepository } from 'src/modules/user/repositories';
import { Cron } from '@nestjs/schedule';
import { Between } from 'typeorm';
import { User } from 'src/modules/user/entities';
import { InjectRepository } from '@nestjs/typeorm';

export class NotificationService {
  constructor(
    private readonly firebaseService: FirebaseService,
    @InjectRepository(OfficehourRepository)
    private officehourRepo: OfficehourRepository,
    private readonly deviceTokenRepo: DeviceTokenRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async saveUserToken(user: User, token: string) {
    const existingToken = await this.deviceTokenRepo.findOne({
      where: {
        user: { id: user.id }, // user의 id로 조건을 변경
        token: token,
      },
    });

    if (!existingToken) {
      const newToken = this.deviceTokenRepo.create({ user, token });
      await this.deviceTokenRepo.save(newToken);
    }
  }

  @Cron('*/10 9-23 * * *')
  async checkAndSendNotifications() {
    const now = new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    const koreaTime = new Date(utcNow.getTime() + 9 * 60 * 60 * 1000);
    koreaTime.setSeconds(0, 0); // 초와 밀리초를 0으로 설정하여 정확한 분 단위로 비교

    console.log('now', now);
    console.log('utcNow', now);
    const tenMinutesLater = new Date(utcNow.getTime() + 10 * 60 * 1000);
    tenMinutesLater.setSeconds(59, 999); // 초와 밀리초를 최대값으로 설정하여 10분 후까지의 범위를 포함

    const notifications = await this.officehourRepo.find({
      where: {
        date: Between(utcNow, tenMinutesLater),
      },
      relations: ['team'],
    });

    if (notifications.length !== 0) {
      const teamIds = notifications.map((n) => n.team.id);

      const tokens = await this.getTokensForTeams(teamIds);

      const messages = notifications
        .map((notification) => {
          const tokensForTeam = tokens.get(notification.team.id) || [];

          return tokensForTeam.map((token) => ({
            token,
            notification: {
              title: '오피스아워 알림',
              body: `잠시 후, ${notification.coach} 코치님의 오피스아워가 있습니다`,
            },
          }));
        })
        .flat();
      await this.sendBulkNotifications(messages);
    } else {
      console.log('알림이 없습니다.', koreaTime);
    }
  }

  private async getTokensForTeams(
    teamIds: string[],
  ): Promise<Map<string, string[]>> {
    const deviceTokens = await this.deviceTokenRepo
      .createQueryBuilder('deviceToken')
      .innerJoinAndSelect('deviceToken.user', 'user')
      .innerJoinAndSelect('user.teams', 'team')
      .where('team.id IN (:...teamIds)', { teamIds })
      .getMany();

    const tokensMap = new Map<string, string[]>();
    deviceTokens.forEach((deviceToken) => {
      deviceToken.user.teams.forEach((team) => {
        if (!tokensMap.has(team.id)) {
          tokensMap.set(team.id, []);
        }
        tokensMap.get(team.id).push(deviceToken.token);
      });
    });
    return tokensMap;
  }

  @Cron('0 23 * * *') // 매일 밤 11시에 실행
  async sendNightlyReminder() {
    const tokens = await this.deviceTokenRepo.find();

    if (tokens.length !== 0) {
      const messages = tokens.map((deviceToken) => ({
        token: deviceToken.token,
        notification: {
          title: '일일 알림',
          body: 'QR, 과제제출 잊지마세요!',
        },
      }));

      console.log('과제 제출 알림');
      await this.sendBulkNotifications(messages);
    } else {
      throw new Error(`등록된 디바이스 토큰이 없습니다.`);
    }
  }
  private async sendBulkNotifications(
    messages: { token: string; notification: any }[],
  ) {
    const promises = messages.map(
      (message) => this.firebaseService.sendNotification(message),
      // this.firebaseService.sendNotification(message.token, {
      //   notification: message.notification,
      // }),
    );
    await Promise.all(promises);
  }
}
