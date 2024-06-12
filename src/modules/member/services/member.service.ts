import { HttpStatus, Injectable } from '@nestjs/common';
import { parseExcel } from 'src/common/utils';
import { validateData } from 'src/common/utils/data-validator';
import { BusinessException } from 'src/exception';
import { TrackRepository } from 'src/modules/track/repositories';
import { User } from 'src/modules/user/entities';
import { UserRepository } from 'src/modules/user/repositories';

@Injectable()
export class MemberService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly trackRepo: TrackRepository,
  ) {}

  async importUsersFromExcel(file: Express.Multer.File): Promise<any> {
    const data = parseExcel(file);

    const fields = [
      { key: 'email', terms: ['이메일'] },
      { key: 'realName', terms: ['이름'] },
      { key: 'phoneNumberKey', terms: ['핸드폰', '휴대폰'] },
      { key: 'trackName', terms: ['트랙'] },
      { key: 'cardinalNo', terms: ['기수'] },
    ];
    const validData = validateData(data, fields);

    const queryRunner = this.userRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    const trackCache = new Map<string, any>();

    // 전화번호 중복 검사를 위한 캐시
    const phoneNumberCache = new Set<string>();

    // 데이터베이스에서 기존의 핸드폰 번호 캐시에 로드
    const existingPhoneNumbers = await this.userRepo.manager.find(User, {
      select: ['phoneNumber'], // 전화번호만 선택
    });
    existingPhoneNumbers.forEach((user) =>
      phoneNumberCache.add(user.phoneNumber),
    );
    try {
      const userToSave: User[] = [];
      for (const item of validData) {
        const { email, realName, trackName, phoneNumberKey, cardinalNo } = item;
        const phoneNumber = phoneNumberKey.replace(/-/g, '');

        const trackKey = `${trackName}-${cardinalNo}`;
        let track = trackCache.get(trackKey);

        // 캐시에 없으면 데이터베이스에서 조회
        if (!track) {
          track = await this.trackRepo.findOne({
            where: { trackName, cardinalNo },
          });
          trackCache.set(trackKey, track);
        }

        // 트랙이 존재하지 않으면 경고 및 건너뛰기
        if (!track) {
          throw new BusinessException(
            'member',
            `트랙 '${trackName} ${cardinalNo}'을 찾을 수 없습니다.`,
            `트랙 '${trackName} ${cardinalNo}'을 찾을 수 없습니다.`,
            HttpStatus.NOT_FOUND,
          );
        }

        if (phoneNumberCache.has(phoneNumber)) {
          console.info(`전화번호 ${phoneNumber}가 이미 존재합니다.`);
          continue; // 이미 존재하는 전화번호는 건너뛰기
        }

        // 캐시에 없으면 새로 추가
        phoneNumberCache.add(phoneNumber);
        const user = new User();
        user.email = email;
        user.realName = realName;
        user.phoneNumber = phoneNumber;
        user.track = track;

        userToSave.push(user);
      }
      await queryRunner.manager.save(User, userToSave);

      await queryRunner.commitTransaction();
      console.info(`Successfully imported ${validData.length} users.`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to import users:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async importCoachesFromExcel(file: Express.Multer.File): Promise<any> {
    const data = parseExcel(file);
    const fields = [
      { key: 'email', terms: ['이메일'] },
      { key: 'realName', terms: ['이름'] },
      { key: 'phoneNumberKey', terms: ['핸드폰', '휴대폰'] },
      { key: 'role', terms: ['역할'] },
    ];

    const validData = validateData(data, fields);

    const queryRunner = this.userRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    // 전화번호 중복 검사를 위한 캐시
    const phoneNumberCache = new Set<string>();

    // 데이터베이스에서 기존의 핸드폰 번호 캐시에 로드
    const existingPhoneNumbers = await this.userRepo.manager.find(User, {
      select: ['phoneNumber'], // 전화번호만 선택
    });
    existingPhoneNumbers.forEach((user) =>
      phoneNumberCache.add(user.phoneNumber),
    );
    try {
      for (const item of validData) {
        const { email, realName, phoneNumberKey, role } = item;
        const phoneNumber = phoneNumberKey.replace(/-/g, '');

        if (phoneNumberCache.has(phoneNumber)) {
          console.info(`전화번호 ${phoneNumber}가 이미 존재합니다.`);
          continue; // 이미 존재하는 전화번호는 건너뛰기
        }

        // 캐시에 없으면 새로 추가
        phoneNumberCache.add(phoneNumber);
        const user = new User();
        user.email = email;
        user.realName = realName;
        user.phoneNumber = phoneNumber;
        user.role = role;

        await queryRunner.manager.save(User, user);
      }

      await queryRunner.commitTransaction();
      console.info(`Successfully imported ${validData.length} users.`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to import users:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
