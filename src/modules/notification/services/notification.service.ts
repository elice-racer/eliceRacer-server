import { FirebaseService } from 'core/firebase/firebase.service';
import { OfficehourRepository } from '../../officehour/repositories/officehour.repository';
import { DeviceTokenRepository } from '../repositories/device.-token.repository';
import { UserRepository } from 'src/modules/user/repositories';
import { Cron } from '@nestjs/schedule';
import { Between } from 'typeorm';
import { User } from 'src/modules/user/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { utcToKoreanTDate } from 'src/common/utils';

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

  @Cron('*/1 4-23 * * *', { timeZone: 'Asia/Seoul' })
  async checkAndSendNotifications() {
    const now = new Date(); // UTC 기준 현재 시간

    const koreaDate = utcToKoreanTDate(now);
    koreaDate.setSeconds(0, 0); // 초와 밀리초를 0으로 설정
    const tenMinutesLater = new Date(koreaDate.getTime() + 10 * 60 * 1000);
    tenMinutesLater.setSeconds(59, 999); // 10분 후까지의 범위를 포함

    const notifications = await this.officehourRepo.find({
      where: {
        date: Between(koreaDate, tenMinutesLater),
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
      console.log('알림이 없습니다.', koreaDate);
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

  @Cron('37 02 * * *', { timeZone: 'Asia/Seoul' }) // 매일 밤 11시에 실행
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

      await this.sendBulkNotifications(messages);
    } else {
      throw new Error(`등록된 디바이스 토큰이 없습니다.`);
    }
  }
  private async sendBulkNotifications(
    messages: { token: string; notification: any }[],
  ) {
    const promises = messages.map((message) =>
      this.firebaseService.sendNotification(message),
    );
    await Promise.all(promises);
  }
}
