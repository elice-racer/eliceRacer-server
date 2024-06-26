import { HttpStatus, Injectable } from '@nestjs/common';
import { TeamRepository } from '../repositories/team.repository';
import { BusinessException } from 'src/exception';
import {
  PaginationTeamsByCardinalDto,
  PaginationTeamsByProjectDto,
  PaginationTeamsByTrackDto,
  PaginationTeamsDto,
  UpdateTeamReqDto,
} from '../dto';
import { UserRepository } from 'src/modules/user/repositories';
import { In } from 'typeorm';
import { TrackRepository } from 'src/modules/track/repositories';
import { ProjectRepository } from 'src/modules/project/repositories/project.repository';
import { ConfigService } from '@nestjs/config';
import { ENV_SERVER_URL_KEY } from 'src/common/const';
import { User } from 'src/modules/user/entities';

@Injectable()
export class TeamService {
  private baseUrl;
  constructor(
    private readonly teamRepo: TeamRepository,
    private readonly userRepo: UserRepository,
    private readonly trackRepo: TrackRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>(ENV_SERVER_URL_KEY);
  }

  async getTeam(teamId: string) {
    const team = await this.teamRepo.findOneBy({ id: teamId });

    if (!team)
      throw new BusinessException(
        'team',
        '해당 팀이 존재하지 않습니다',
        '해당 팀이 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );

    return team;
  }

  async getAllTeams(dto: PaginationTeamsDto) {
    const { pageSize } = dto;
    const teams = await this.teamRepo.findAllTeams(dto);

    let next: string | null = null;
    if (teams.length > parseInt(pageSize)) {
      const lastTeam = teams[parseInt(pageSize) - 1];
      next = `${this.baseUrl}/api/teams/all?pageSize=${pageSize}&lastTrackName=${lastTeam.project.track.trackName}&lastCardinalNo=${lastTeam.project.track.cardinalNo}&lastRound=${lastTeam.project.round}&lastTeamNumber=${lastTeam.teamNumber}`;
      teams.pop();
    }

    return { teams, pagination: { next, count: teams.length } };
  }

  async getTeamsByTrack(dto: PaginationTeamsByTrackDto) {
    const { trackName, pageSize } = dto;

    const track = await this.trackRepo.findOne({ where: { trackName } });

    if (!track)
      throw new BusinessException(
        `project`,
        `해당 트랙(${trackName})이 존재하지 않습니다.`,
        `해당 트랙(${trackName})이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    const teams = await this.teamRepo.findTeamsByTrack(dto);

    let next: string | null = null;
    if (teams.length > parseInt(pageSize)) {
      const lastTeam = teams[parseInt(pageSize) - 1];
      next = `${this.baseUrl}/api/teams/tracks/all?pageSize=${pageSize}&trackName=${trackName}&lastCardinalNo=${lastTeam.project.track.cardinalNo}&lastRound=${lastTeam.project.round}&lastTeamNumber=${lastTeam.teamNumber}`;
      teams.pop();
    }

    return { teams, pagination: { next, count: teams.length } };
  }

  async getTeamsByCardinalNo(dto: PaginationTeamsByCardinalDto) {
    const { pageSize, trackName, cardinalNo } = dto;

    const track = await this.trackRepo.findOne({
      where: { trackName, cardinalNo: parseInt(cardinalNo) },
    });

    if (!track)
      throw new BusinessException(
        `project`,
        `해당 트랙(${trackName}${cardinalNo})이 존재하지 않습니다.`,
        `해당 트랙(${trackName}${cardinalNo})이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );
    const teams = await this.teamRepo.findTeamsByCardinalNo(dto);

    let next: string | null = null;
    if (teams.length > parseInt(pageSize)) {
      const lastTeam = teams[parseInt(pageSize) - 1];
      next = `${this.baseUrl}/api/teams/cardinals/all?pageSize=${pageSize}&trackName=${trackName}&cardinalNo=${cardinalNo}&lastRound=${lastTeam.project.round}&lastTeamNumber=${lastTeam.teamNumber}`;
      teams.pop();
    }

    return { teams, pagination: { next, count: teams.length } };
  }

  async getTeamsByProject(dto: PaginationTeamsByProjectDto) {
    const { projectId, pageSize } = dto;

    const project = await this.projectRepo.findOneBy({ id: projectId });

    if (!project)
      throw new BusinessException(
        `project`,
        `해당 프로젝트가 존재하지 않습니다.`,
        `해당 프로젝트가 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    const teams = await this.teamRepo.findTeamsByProject(dto);
    let next: string | null = null;
    if (teams.length > parseInt(pageSize)) {
      const lastTeam = teams[parseInt(pageSize) - 1];
      next = `${this.baseUrl}/api/teams/projects/all?pageSize=${pageSize}&projectId=${projectId}&lastTeamNumber=${lastTeam.teamNumber}`;
      teams.pop(); // Remove the extra item used for determining the next cursor
    }

    return { teams, pagination: { next, count: teams.length } };
  }

  async updateTeam(teamId: string, dto: UpdateTeamReqDto, user: User) {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['users'],
    });

    if (!team)
      throw new BusinessException(
        'team',
        '해당 팀이 존재하지 않습니다',
        '해당 팀이 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );

    const isMember = team.users.some((u) => u.id === user.id);

    if (!isMember) {
      throw new BusinessException(
        'team',
        '해당 작업을 수행할 권한이 없습니다',
        '팀 멤버만이 팀 정보를 업데이트할 수 있습니다',
        HttpStatus.FORBIDDEN,
      );
    }
    team.teamName = dto.teamName;
    team.teamNumber = dto.teamNumber;
    team.notion = dto.notion;

    return this.teamRepo.save(team);
  }

  async updateTeamMember(teamId: string, userIds: string[]) {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['users'],
    });

    if (!team)
      throw new BusinessException(
        'team',
        '해당 팀이 존재하지 않습니다',
        '해당 팀이 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );

    const users = await this.userRepo.find({
      where: {
        id: In(userIds),
      },
    });

    if (users.length === 0)
      throw new BusinessException(
        'user',
        '유저가 존재하지 않습니다',
        `유저가 존재하지 않습니다`,
        HttpStatus.NOT_FOUND,
      );

    if (userIds.length !== users?.length) {
      throw new BusinessException(
        'user',
        '일부 유저가 존재하지 않습니다',
        `일부 유저가 존재하지 않습니다`,
        HttpStatus.NOT_FOUND,
      );
    }

    team.users = users;

    return this.teamRepo.save(team);
  }

  async deleteTeam(id: string) {
    const team = await this.teamRepo.findOneBy({ id });

    if (!team)
      throw new BusinessException(
        'team',
        '해당 팀이 존재하지 않습니다',
        '해당 팀이 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );

    await this.teamRepo.remove(team);
  }
}
