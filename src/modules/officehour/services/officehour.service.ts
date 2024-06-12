import { Injectable } from '@nestjs/common';
import { parseExcel } from 'src/common/utils';
import { validateData } from 'src/common/utils/data-validator';
import { OfficehourRepository } from '../repositories/officehour.repository';
import { Officehour } from '../entities/officehour.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { Project } from 'src/modules/project/entities';

@Injectable()
export class OfficehourService {
  constructor(private readonly officehourRepo: OfficehourRepository) {}

  async getOfficehourByProject(projectId: string) {
    return this.officehourRepo.find({
      order: {
        date: 'ASC', // 오름차순으로 정렬
      },
      where: {
        project: { id: projectId },
      },
    });
  }

  async getOfficehourByTeam(teamId: string) {
    return this.officehourRepo.find({
      order: {
        date: 'ASC', // 오름차순으로 정렬
      },
      where: {
        team: { id: teamId },
      },
    });
  }
  async importOfficehoursFromExcel(
    file: Express.Multer.File,
    projectId: string,
  ): Promise<any> {
    const data = parseExcel(file);

    const fields = [
      { key: 'teamNumber', terms: ['팀'] },
      { key: 'coach', terms: ['코치'] },
      { key: 'timeStr', terms: ['시간'] },
      { key: 'dateStr', terms: ['날짜'] },
      { key: 'type', terms: ['타입'] },
    ];

    const validData = validateData(data, fields);

    const queryRunner =
      this.officehourRepo.manager.connection.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const officeHoursToSave: Officehour[] = [];
      const project = await queryRunner.manager.findOne(Project, {
        where: { id: projectId },
      });

      if (project) await queryRunner.manager.delete(Officehour, { project });

      const teamCache = new Map();

      // 먼저 해당 팀의 기존 오피스 아워를 삭제합니다.

      for (const item of validData) {
        const { teamNumber, coach, dateStr, timeStr, type } = item;
        let team = teamCache.get(teamNumber);

        if (!team) {
          team = await queryRunner.manager.findOne(Team, {
            where: { teamNumber, project: { id: projectId } },
          });

          teamCache.set(teamNumber, team);
        }
        const dateTime = this.excelDateToJSDate(dateStr, timeStr);

        const officeHour = new Officehour();
        officeHour.date = dateTime;
        officeHour.coach = coach;
        officeHour.project = project;
        officeHour.team = team;
        officeHour.type = type;

        officeHoursToSave.push(officeHour);
      }

      // 모든 데이터를 한 번에 저장
      const result = await queryRunner.manager.save(
        Officehour,
        officeHoursToSave,
      );
      await queryRunner.commitTransaction();

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error('Failed to update office hours');
    } finally {
      await queryRunner.release();
    }
  }

  private excelDateToJSDate(dateNum: number, timeNum: number): Date {
    const date = new Date(Math.round((dateNum - 25569) * 86400 * 1000));
    const timeInSeconds = timeNum * 86400;
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);

    date.setHours(hours + 9, minutes, 0);
    return date;
  }
}
