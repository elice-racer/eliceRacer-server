import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { TeamRepository } from '../repositories/team.repository';
import { BusinessException } from 'src/exception';
import { Team } from '../entities/team.entity';
import {
  PaginationTeamsByCardinalDto,
  PaginationTeamsByProjectDto,
  PaginationTeamsByTrackDto,
  PaginationTeamsDto,
  UpdateTeamMemberReqDto,
  UpdateTeamReqDto,
} from '../dto';
import { UserRepository } from 'src/modules/user/repositories';
import { User } from 'src/modules/user/entities';
import { TrackRepository } from 'src/modules/track/repositories';
import { Track } from 'src/modules/track/entities';
import { ProjectRepository } from 'src/modules/project/repositories/project.repository';
import { Project } from 'src/modules/project/entities';
import { ConfigService } from '@nestjs/config';

jest.unmock('./team.service');

describe('TeamService', () => {
  let service: TeamService;
  let teamRepo: jest.Mocked<TeamRepository>;
  let userRepo: jest.Mocked<UserRepository>;
  let trackRepo: jest.Mocked<TrackRepository>;
  let projectRepo: jest.Mocked<ProjectRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        TeamRepository,
        UserRepository,
        TrackRepository,
        ProjectRepository,
        ConfigService,
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    teamRepo = module.get(TeamRepository);
    userRepo = module.get(UserRepository);
    trackRepo = module.get(TrackRepository);
    projectRepo = module.get(ProjectRepository);
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

  describe('getAllTeams', () => {
    const dto: PaginationTeamsDto = {
      pageSize: '10',
      lastTrackName: 'track-name',
      lastCardinalNo: '1',
      lastRound: '1',
      lastTeamNumber: '1',
    };
    it('팀이 존재하면 트랙이름, 기수, 회차, 팀 번호를 오름차순으로 반환한다', async () => {
      const team: Team[] = [{ teamName: 'team1' } as Team];

      teamRepo.findAllTeams.mockResolvedValue(team);

      const result = await service.getAllTeams(dto);
      const expectedPagination = { next: null, count: 1 };

      expect(result.teams).toEqual(team);
      expect(result.pagination).toEqual(expectedPagination);
    });
  });

  describe('getTeamsByTrack', () => {
    const dto: PaginationTeamsByTrackDto = {
      trackName: 'track-name',
      pageSize: '10',
      lastCardinalNo: '1',
      lastRound: '1',
      lastTeamNumber: '1',
    };
    it('트랙이 존재하지 않으면 BusinessException을 던진다', async () => {
      trackRepo.findOne.mockResolvedValue(undefined);

      await expect(service.getTeamsByTrack(dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('팀이 존재하면 기수, 프로젝트 회차, 팀번호 오름차순으로 반환한다', async () => {
      const track = new Track();
      const team: Team[] = [{ teamName: 'team1' } as Team];

      trackRepo.findOne.mockResolvedValue(track);
      teamRepo.findTeamsByTrack.mockResolvedValue(team);

      const result = await service.getTeamsByTrack(dto);
      const expectedPagination = { next: null, count: 1 };

      expect(result.teams).toEqual(team);
      expect(result.pagination).toEqual(expectedPagination);
    });
  });

  describe('getTeamsByCardinalNo', () => {
    const dto: PaginationTeamsByCardinalDto = {
      trackName: 'track-name',
      cardinalNo: '1',
      pageSize: '10',
      lastRound: '1',
      lastTeamNumber: '1',
    };
    it('트랙이 존재하지 않으면 BusinessException을 던진다', async () => {
      trackRepo.findOne.mockResolvedValue(undefined);

      await expect(service.getTeamsByCardinalNo(dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('팀이 존재하면 프로젝트 회차, 팀 번호 오름차순으로 반환한다', async () => {
      const track = new Track();
      const team: Team[] = [{ teamName: 'team1' } as Team];

      trackRepo.findOne.mockResolvedValue(track);
      teamRepo.findTeamsByCardinalNo.mockResolvedValue(team);

      const result = await service.getTeamsByCardinalNo(dto);
      const expectedPagination = { next: null, count: 1 };

      expect(result.teams).toEqual(team);
      expect(result.pagination).toEqual(expectedPagination);
    });
  });

  describe('getTeamsByProject', () => {
    const dto: PaginationTeamsByProjectDto = {
      projectId: 'project-id',
      pageSize: '10',
      lastTeamNumber: '1',
    };
    it('프로젝트가 존재하지 않으면 BusinessException을 던진다', async () => {
      projectRepo.findOneBy.mockResolvedValue(undefined);

      await expect(service.getTeamsByProject(dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('팀이 존재하면 프로젝트 팀 번호 오름차순으로 반환한다', async () => {
      const project = new Project();
      const team: Team[] = [{ teamName: 'team1' } as Team];

      projectRepo.findOneBy.mockResolvedValue(project);
      teamRepo.findTeamsByProject.mockResolvedValue(team);

      const result = await service.getTeamsByProject(dto);
      const expectedPagination = { next: null, count: 1 };

      expect(result.teams).toEqual(team);
      expect(result.pagination).toEqual(expectedPagination);
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
