import { HttpStatus, Injectable } from '@nestjs/common';
import { TeamRepository } from '../repositories/team.repository';
import { BusinessException } from 'src/exception';
import { PaginationAllTeamsDto, UpdateTeamReqDto } from '../dto';
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
    //TODO 여기서 부터하기 track도 필요
    const team = await this.teamRepo.findTeamDetail(teamId);

    // await this.teamRepo.findOne({
    //   where: { id: teamId },
    //   relations: ['users', 'project'],
    // });

    if (!team)
      throw new BusinessException(
        'team',
        '해당 팀이 존재하지 않습니다',
        '해당 팀이 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );

    return team;
  }

  async getAllTeams(dto: PaginationAllTeamsDto) {
    const { pageSize, trackName, cardinalNo, round } = dto;
    const teams = await this.teamRepo.findAllTeams(dto);

    let next: string | null = null;
    if (teams.length > pageSize) {
      const lastTeam = teams[pageSize - 1];
      next = `${this.baseUrl}/api/teams/all?pageSize=${pageSize}&trackName=${trackName}&cardinalNo=${cardinalNo}&round=${round}&lastTrackName=${lastTeam.project.track.trackName}&lastCardinalNo=${lastTeam.project.track.cardinalNo}&lastRound=${lastTeam.project.round}&lastTeamNumber=${lastTeam.teamNumber}`;
      teams.pop();
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
