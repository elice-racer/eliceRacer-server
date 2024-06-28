import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from '../dto/create-admin.dto';
import * as argon2 from 'argon2';
import { excelDateToJSDate, generateToken } from 'src/common/utils';
import { MailService } from 'src/modules/mail/mail.service';
import { VerificationService } from 'src/modules/auth/services/verification.service';
import { AdminRepository } from '../repositories';
import { User, UserRole, UserStatus } from 'src/modules/user/entities';
import { BusinessException } from 'src/exception';
import { parseExcel } from 'src/common/utils';
import { validateDataWithCoaches } from 'src/common/utils/data-validator';
import { EntityManager, In } from 'typeorm';
import { ProjectRepository } from 'src/modules/project/repositories/project.repository';
import { TeamRepository } from 'src/modules/team/repositories/team.repository';
import { UserRepository } from 'src/modules/user/repositories';
import { Team } from 'src/modules/team/entities/team.entity';
import { Project } from 'src/modules/project/entities';
import { TrackRepository } from 'src/modules/track/repositories';
import { Officehour } from 'src/modules/officehour/entities/officehour.entity';
import { Track } from 'src/modules/track/entities';

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

    const validData = validateDataWithCoaches(data, fields);
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.processTeamsAndProjects(queryRunner, validData);
      await queryRunner.commitTransaction();
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async processTeamsAndProjects(queryRunner, validData) {
    const { trackName, cardinalNo, projectName, round } = validData[0];
    const track = await queryRunner.manager
      .findOneOrFail(Track, {
        where: { trackName, cardinalNo },
      })
      .catch(() => {
        throw new BusinessException(
          `user`,
          `해당 트랙(${trackName}${cardinalNo})이 존재하지 않습니다.`,
          `해당 트랙(${trackName}${cardinalNo})을 찾을 수 없습니다. 트랙을 먼저 생성해주세요.`,
          HttpStatus.NOT_FOUND,
        );
      });

    const project = await queryRunner.manager.findOne(Project, {
      where: { track: { id: track.id }, projectName, round },
      relations: ['teams', 'officehours'],
    });

    if (project) {
      await this.removeProjectDependencies(queryRunner, project);
    }

    const newProject = await this.createProject(
      queryRunner,
      track,
      validData[0],
    );

    await this.processTeams(queryRunner, validData, newProject);
  }

  private async removeProjectDependencies(queryRunner, project) {
    await queryRunner.manager.remove(Officehour, project.officehours);
    await queryRunner.manager.remove(Team, project.teams);
    await queryRunner.manager.remove(Project, project);
  }

  private async createProject(queryRunner, track, projectData) {
    const { projectName, round, startDate, endDate } = projectData;
    const processedStartDate = excelDateToJSDate(startDate);
    const processedEndDate = excelDateToJSDate(endDate);

    const project = queryRunner.manager.create(Project, {
      projectName,
      round,
      startDate: processedStartDate,
      endDate: processedEndDate,
      track,
    });

    return queryRunner.manager.save(project);
  }

  private async processTeams(queryRunner, validData, project) {
    const teamCache = new Map();
    const phoneNumbers = validData.map((item) =>
      item.phoneNumberKey.replace(/-/g, ''),
    );
    const users: User[] = await queryRunner.manager.find(User, {
      where: { phoneNumber: In(phoneNumbers), role: UserRole.RACER },
      relations: ['teams'],
    });

    const userMap = new Map(users.map((user) => [user.phoneNumber, user]));

    const coachNames = new Set(validData.flatMap((item) => item.coaches || []));
    const coaches: User[] = await queryRunner.manager.find(User, {
      where: { role: UserRole.COACH, realName: In(Array.from(coachNames)) },
      relations: ['teams'],
    });
    const coachMap = new Map(coaches.map((coach) => [coach.realName, coach]));

    for (const item of validData) {
      const { teamNumber, phoneNumberKey, coaches: coachNames, notion } = item;
      let team = teamCache.get(teamNumber);
      if (!team) {
        team = await this.findOrCreateTeam(
          queryRunner,
          teamNumber,
          project,
          notion,
        );
        teamCache.set(teamNumber, team);
      }

      const phoneNumber = phoneNumberKey.replace(/-/g, '');
      const racer = userMap.get(phoneNumber);

      if (racer && !team.users.find((user) => user.id === racer.id)) {
        this.addRacerToTeam(racer, team);
        await queryRunner.manager.save(racer);
      }

      if (coachNames && coachNames.length > 0) {
        for (const name of coachNames) {
          const coach = coachMap.get(name);
          if (coach && !team.users.find((user) => user.id === coach.id)) {
            this.addCoachToTeam(coach, team);
            await queryRunner.manager.save(coach);
          }
        }
      }
    }
  }

  private async findOrCreateTeam(queryRunner, teamNumber, project, notion) {
    let team = await queryRunner.manager.findOne(Team, {
      where: { teamNumber, project },
    });

    if (!team) {
      team = queryRunner.manager.create(Team, {
        teamNumber,
        project,
        notion,
        users: [],
      });
      await queryRunner.manager.save(team);
    }

    return team;
  }

  private addRacerToTeam(racer: User, team: Team) {
    if (!racer.teams) {
      racer.teams = [];
    }
    team.users.push(racer);
    racer.teams.push(team);
  }

  private addCoachToTeam(coach: User, team: Team) {
    if (!coach.teams) {
      coach.teams = [];
    }
    if (!team.users.find((user) => user.id === coach.id)) {
      team.users.push(coach);
      coach.teams.push(team);
    }
  }
}
