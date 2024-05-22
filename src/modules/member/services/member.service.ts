import { HttpStatus, Injectable } from '@nestjs/common';
import { BusinessException } from 'src/exception/BusinessException';
import { TrackRespository } from 'src/modules/track/repositories';
import { User } from 'src/modules/user/entities';
import { UserRepository } from 'src/modules/user/repositories';
import * as XLSX from 'xlsx';

@Injectable()
export class MemberService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly trackRepo: TrackRespository,
  ) {}

  async importUsersFromExcel(file: Express.Multer.File): Promise<any> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet) as Array<
      Record<string, string>
    >;

    const processedData = data.map((item: Record<string, string>) => {
      const emailKey =
        Object.keys(item).find((key) => key.includes('이메일')) || '';
      const nameKey =
        Object.keys(item).find((key) => key.includes('이름')) || '';
      const phoneKey =
        Object.keys(item).find(
          (key) => key.includes('핸드폰') || key.includes('휴대폰'),
        ) || '';
      const trackNameKey =
        Object.keys(item).find((key) => key.includes('트랙')) || '';
      const cardinalNoKey =
        Object.keys(item).find((key) => key.includes('기수')) || '';

      // 핸드폰 번호에서 하이픈 제거
      const phoneNumber = item[phoneKey].replace(/-/g, '');

      return {
        email: item[emailKey],
        realName: item[nameKey],
        phoneNumber, // 하이픈이 제거된 핸드폰 번호
        trackName: item[trackNameKey],
        cardinalNo: item[cardinalNoKey],
      };
    });

    // 데이터베이스 트랜잭션 시작
    const queryRunner = this.userRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      for (const item of processedData) {
        const { email, realName, trackName, phoneNumber, cardinalNo } = item;

        // 트랙 정보 확인
        const track = await this.trackRepo.findOne({
          where: { trackName, cardinalNo },
        });

        // 트랙이 존재하지 않는 경우 에러 발생
        if (!track) {
          throw new BusinessException(
            'track',
            `트랙 '(${trackName}${cardinalNo})'을 찾을 수 없습니다.`,
            `트랙 '(${trackName}${cardinalNo})'을 찾을 수 없습니다. 먼저 트랙을 생성하세요.`,
            HttpStatus.NOT_FOUND,
          );
        }

        const user = new User();
        user.email = email;
        user.realName = realName;
        user.phoneNumber = phoneNumber;
        user.track = track;

        // 유저 정보 저장
        await queryRunner.manager.save(User, user);
      }
      // 모든 처리가 성공하면 트랜잭션 커밋
      await queryRunner.commitTransaction();
    } catch (error) {
      // 오류 발생 시 트랜잭션 롤백
      await queryRunner.rollbackTransaction();
      throw error; // 오류 재발생시키기
    } finally {
      // 트랜잭션 종료
      await queryRunner.release();
    }
  }
}
