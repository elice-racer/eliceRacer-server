import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from '../dto/create-admin.dto';
import * as argon2 from 'argon2';
import { convertDate, generateToken } from 'src/common/utils';
import { MailService } from 'src/modules/mail/mail.service';
import { VerificationService } from 'src/modules/auth/services/verification.service';
import { AdminRepository } from '../repositories';
import { User, UserRole, UserStatus } from 'src/modules/user/entities';
import { BusinessException } from 'src/exception';
import { parseExcel } from 'src/common/utils';
import { validateCoaches, validateData } from 'src/common/utils/data-validator';
import { EntityManager, In } from 'typeorm';
import { ProjectRepository } from 'src/modules/project/repositories/project.repository';
import { TeamRepository } from 'src/modules/team/repositories/team.repository';
import { UserRepository } from 'src/modules/user/repositories';
import { Team } from 'src/modules/team/entities/team.entity';
import { Project } from 'src/modules/project/entities';
import { TrackRepository } from 'src/modules/track/repositories';

@Injectable()
export class AdminService {
  constructor(
    private readonly mailService: MailService,
    private readonly verificationService: VerificationService,
    private readonly adminRepo: AdminRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly teamRepo: TeamRepository,
    private readonly userRepo: UserRepository,
    private readonly trackRepo: TrackRepository,
    private readonly entityManager: EntityManager,
  ) {}
  async verifyEmail(id: string, token: string) {
    const result = await this.verificationService.verifyCode(
      `emailCode:${id}`,
      token,
    );
    if (!result) return result;

    this.verificationService.deleteVerificationCode(id);

    if (result)
      this.adminRepo.updateStatusAfterVerification(
        id,
        UserStatus.VERIFIED_AND_REGISTERED,
      );
    return result;
  }

  async signup(dto: CreateAdminDto): Promise<void> {
    const verificationToken = generateToken();

    const admin = await this.createAdmin(dto);

    await Promise.all([
      this.verificationService.setVerificationCode(
        `emailCode:${admin.id}`,
        verificationToken,
        60 * 60, //1시간,
      ),
      this.mailService.sendVerificationEmail(
        admin,
        verificationToken,
        'admins',
      ),
    ]);
  }

  async createAdmin(dto: CreateAdminDto) {
    const user = await this.adminRepo.findUserByEmailOrUsername(dto.email);

    if (user)
      throw new BusinessException(
        'admin',
        `${dto.email} 은 이미 존재하는 이메일입니다`,
        `${dto.email} 은 이미 존재하는 이메일입니다`,
        HttpStatus.BAD_REQUEST,
      );

    const hashedPassword = await argon2.hash(dto.password);

    return await this.adminRepo.createAdmin(dto, hashedPassword);
  }

  //TODO 이동
  async createTeamAndProject(file: Express.Multer.File) {
    const data = parseExcel(file);

    const fields = [
      { key: 'trackName', terms: ['트랙'] },
      { key: 'cardinalNo', terms: ['기수'] },
      { key: 'projectName', terms: ['프로젝트'] },
      { key: 'round', terms: ['회차'] },
      { key: 'teamNumber', terms: ['팀'] },
      { key: 'realName', terms: ['이름'] },
      { key: 'phoneNumberKey', terms: ['핸드폰', '휴대폰'] },
      { key: 'notion', terms: ['노션'] },
      { key: 'startDate', terms: ['시작'] },
      { key: 'endDate', terms: ['종료'] },
    ];

    const validData = validateData(data, fields);

    const validCoachesData = validateCoaches(data, fields);

    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { trackName, cardinalNo, projectName, round } = validData[0];

      const track = await this.trackRepo.findOne({
        where: { trackName, cardinalNo },
      });

      if (!track)
        throw new BusinessException(
          `user`,
          `해당 트랙(${trackName}${cardinalNo})이 존재하지 않습니다.`,
          `해당 트랙(${trackName}${cardinalNo})이 존재하지 않습니다. 트랙을 먼저 생성해주세요 `,
          HttpStatus.NOT_FOUND,
        );

      const existingProject = await queryRunner.manager.findOne(Project, {
        where: { track: { id: track.id }, projectName, round },
        relations: ['teams'],
      });

      if (existingProject) {
        await queryRunner.manager.remove(Team, existingProject.teams); // 연관된 팀 삭제
        await queryRunner.manager.remove(Project, existingProject); // 프로젝트 삭제
      }

      const processedStartDate = convertDate(validData[0].startDate);
      const processedEndDate = convertDate(validData[0].endDate);

      const project = queryRunner.manager.create(Project, {
        projectName: validData[0].projectName,
        round: validData[0].round,
        startDate: processedStartDate,
        endDate: processedEndDate,
        track,
      });
      await queryRunner.manager.save(project);

      const teamCache = new Map();

      for (const item of validCoachesData) {
        const { teamNumber, phoneNumberKey, coaches, notion } = item;
        const phoneNumber = phoneNumberKey.replace(/-/g, '');
        let team = teamCache.get(teamNumber);
        if (!team) {
          team = await queryRunner.manager.findOne(Team, {
            where: { teamNumber: teamNumber, project },
          });
          if (!team) {
            team = queryRunner.manager.create(Team, {
              teamNumber: teamNumber,
              project,
              notion,
              users: [],
            });

            await queryRunner.manager.save(team);
            teamCache.set(teamNumber, team);
          }
        }
        const racer = await queryRunner.manager.findOne(User, {
          where: { phoneNumber, role: UserRole.RACER },
          relations: ['teams'],
        });

        if (racer && !team.users.find((u) => u.id === racer.id)) {
          if (!racer.teams) {
            racer.teams = [];
          }
          team.users.push(racer);
          racer.teams.push(team);
          await queryRunner.manager.save(racer);
        }

        if (coaches && coaches.length > 0) {
          const coachesArr = await queryRunner.manager.find(User, {
            where: {
              role: UserRole.COACH,
              realName: In(coaches),
            },
            relations: ['teams'],
          });

          for (const coach of coachesArr) {
            if (!coach.teams) {
              coach.teams = [];
            }
            if (!team.users.find((u) => u.id === coach.id)) {
              team.users.push(coach);
              coach.teams.push(team);
              await queryRunner.manager.save(coach);
            }
          }
        }
        await queryRunner.manager.save(team);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
