import { HttpStatus, Injectable } from '@nestjs/common';
import { TeamRepository } from '../repositories/team.repository';
import { BusinessException } from 'src/exception';
import { UpdateTeamMemberReqDto, UpdateTeamReqDto } from '../dto';
import { UserRepository } from 'src/modules/user/repositories';
import { In } from 'typeorm';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepo: TeamRepository,
    private readonly userRepo: UserRepository,
  ) {}

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

  async getAllTeams() {}
  async getTeamsByProject() {}
  async getTeamsByTrack() {}

  async updateTeam(teamId: string, dto: UpdateTeamReqDto) {
    const team = await this.teamRepo.findOneBy({ id: teamId });

    if (!team)
      throw new BusinessException(
        'team',
        '해당 팀이 존재하지 않습니다',
        '해당 팀이 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );

    team.teamName = dto.teamName;
    team.teamNumber = dto.teamNumber;
    team.notion = dto.notion;

    return this.teamRepo.save(team);
  }

  async updateTeamMember(teamId: string, dto: UpdateTeamMemberReqDto) {
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
    const userIds: string[] = dto.users.map((user) => user.id);
    const users = await this.userRepo.find({
      where: {
        id: In(userIds),
      },
    });

    if (!users)
      throw new BusinessException(
        'user',
        '유저가 존재하지 않습니다',
        `유저가 존재하지 않습니다`,
        HttpStatus.NOT_FOUND,
      );

    if (userIds.length !== users?.length) {
      const existringUserIds = users.map((user) => user.id);
      const missingUsers = dto.users.filter(
        (user) => !existringUserIds.includes(user.id),
      );
      const missingNames = missingUsers
        .map((user) => `이름: ${user.realName}`)
        .join(', ');

      throw new BusinessException(
        'user',
        '일부 유저가 존재하지 않습니다',
        `일부 유저가 존재하지 않습니다 : ${missingNames}`,
        HttpStatus.NOT_FOUND,
      );
    }

    team.users = users;

    return this.teamRepo.save(team);
  }
}
