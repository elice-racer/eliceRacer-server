import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { TeamRepository } from '../repositories/team.repository';
import { BusinessException } from 'src/exception';
import { Team } from '../entities/team.entity';
import { UpdateTeamMemberReqDto, UpdateTeamReqDto } from '../dto';
import { UserRepository } from 'src/modules/user/repositories';
import { User } from 'src/modules/user/entities';

jest.unmock('./team.service');

describe('TeamService', () => {
  let service: TeamService;
  let teamRepo: jest.Mocked<TeamRepository>;
  let userRepo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamService, TeamRepository, UserRepository],
    }).compile();

    service = module.get<TeamService>(TeamService);
    teamRepo = module.get(TeamRepository);
    userRepo = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTeam', () => {
    const teamId = 'uuid';

    it('팀이 존재하지 않으면 BusinessException을 던진다', async () => {
      teamRepo.findOneBy.mockResolvedValue(undefined);

      await expect(service.getTeam(teamId)).rejects.toThrow(BusinessException);
    });

    it('팀이 존재하면 해당 팀을 반환한다', async () => {
      const team = new Team();

      teamRepo.findOneBy.mockResolvedValue(team);

      const result = await service.getTeam(teamId);

      expect(result).toEqual(team);
    });
  });

  describe('updateTeam', () => {
    const teamId = 'uuid';
    const dto: UpdateTeamReqDto = {
      teamName: 'team-name',
      teamNumber: 1,
      notion: 'notion-url',
    };
    it('팀이 존재하지 않으면 BusinessException을 던진다', async () => {
      teamRepo.findOneBy.mockResolvedValue(undefined);

      await expect(service.updateTeam(teamId, dto)).rejects.toThrow(
        BusinessException,
      );
    });
    it('팀이 존재하면 dto에 맞춰 수정 후 반환한다', async () => {
      const team = new Team();
      team.teamName = dto.teamName;
      team.teamNumber = dto.teamNumber;
      team.notion = dto.notion;

      teamRepo.findOneBy.mockResolvedValue(team);
      teamRepo.save.mockResolvedValue(team);

      const result = await service.updateTeam(teamId, dto);

      expect(result).toEqual(team);
    });
  });

  describe('updateTeamMember', () => {
    const teamId = 'uuid';
    const dto: UpdateTeamMemberReqDto = {
      users: [
        {
          id: 'uuid-1',
          realName: 'name1',
        },
        {
          id: 'uuid-2',
          realName: 'name2',
        },
        {
          id: 'uuid-3',
          realName: 'name3',
        },
        {
          id: 'uuid-4',
          realName: 'name4',
        },
      ],
    };

    it('팀이 존재하지 않으면 BusinessException을 던진다', async () => {
      teamRepo.findOne.mockResolvedValue(undefined);

      await expect(service.updateTeamMember(teamId, dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('팀에 등록하려는 유저가 존재하지 않으면 BusinessException을 던진다', async () => {
      const team = new Team();

      teamRepo.findOne.mockResolvedValue(team);
      userRepo.find.mockResolvedValue([]);

      await expect(service.updateTeamMember(teamId, dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('팀에 등록하려는 유저의 일부가 존재하지 않으면 BusinessException을 던진다', async () => {
      const team = new Team();

      teamRepo.findOne.mockResolvedValue(team);
      userRepo.find.mockResolvedValue([
        { id: 'uuid', realName: 'existing-user' },
      ] as User[]);

      await expect(service.updateTeamMember(teamId, dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('팀이 존재하면 팀멤버를 변경하고 해당 팀을 반환한다', async () => {
      const team = new Team();

      teamRepo.findOne.mockResolvedValue(team);
      userRepo.find.mockResolvedValue([...dto.users] as User[]);
      teamRepo.save.mockResolvedValue(team);

      const result = await service.updateTeamMember(teamId, dto);

      expect(result).toEqual(team);
    });
  });
});
