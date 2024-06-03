import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import {
  PaginationTeamsByCardinalDto,
  PaginationTeamsByProjectDto,
  PaginationTeamsByTrackDto,
  PaginationTeamsDto,
} from '../dto';

export class TeamRepository extends Repository<Team> {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findAllTeams(dto: PaginationTeamsDto) {
    const {
      pageSize,
      lastTrackName,
      lastCardinalNo,
      lastRound,
      lastTeamNumber,
    } = dto;

    const query = this.repo
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.project', 'project')
      .leftJoinAndSelect('project.track', 'track')
      .orderBy('track.track_name', 'ASC')
      .addOrderBy('track.cardinal_no', 'ASC')
      .addOrderBy('project.round', 'ASC')
      .addOrderBy('team.team_number', 'ASC');

    if (lastTrackName && lastCardinalNo && lastRound && lastTeamNumber) {
      query.andWhere(
        `(track.track_name > :lastTrackName) OR 
          (track.track_name = :lastTrackName AND track.cardinal_no > :lastCardinalNo) OR 
          (track.track_name = :lastTrackName AND track.cardinal_no = :lastCardinalNo AND project.round > :lastRound) OR
          (track.track_name = :lastTrackName AND track.cardinal_no = :lastCardinalNo AND project.round = :lastRound AND team.team_number > :lastTeamNumber)`,
        {
          lastTrackName,
          lastCardinalNo: parseInt(lastCardinalNo),
          lastRound: parseInt(lastRound),
          lastTeamNumber: parseInt(lastTeamNumber),
        },
      );
    }

    return query.limit(parseInt(pageSize) + 1).getMany();
  }

  async findTeamsByTrack(dto: PaginationTeamsByTrackDto) {
    const { trackName, pageSize, lastCardinalNo, lastRound, lastTeamNumber } =
      dto;

    console.log(trackName);
    const query = this.repo
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.project', 'project')
      .leftJoinAndSelect('project.track', 'track')
      .where('track.track_name = :trackName', { trackName })
      .orderBy('track.cardinal_no', 'ASC')
      .addOrderBy('project.round', 'ASC')
      .addOrderBy('team.team_number', 'ASC');

    if (lastCardinalNo && lastRound && lastTeamNumber) {
      query.andWhere(
        `(track.cardinal_no > :lastCardinalNo) OR 
        (track.cardinal_no = :lastCardinalNo AND project.round > :lastRound) OR 
        (track.cardinal_no = :lastCardinalNo AND project.round = :lastRound AND team.team_number > :lastTeamNumber)`,
        {
          lastCardinalNo: parseInt(lastCardinalNo),
          lastRound: parseInt(lastRound),
          lastTeamNumber: parseInt(lastTeamNumber),
        },
      );
    }

    return query.limit(parseInt(pageSize) + 1).getMany();
  }

  async findTeamsByCardinalNo(dto: PaginationTeamsByCardinalDto) {
    const { trackName, cardinalNo, pageSize, lastRound, lastTeamNumber } = dto;

    const query = this.repo
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.project', 'project')
      .leftJoinAndSelect('project.track', 'track')
      .where(
        'track.track_name = :trackName AND track.cardinal_no = :cardinalNo',
        { trackName, cardinalNo: parseInt(cardinalNo) },
      )
      .orderBy('project.round', 'ASC');

    if (lastRound && lastTeamNumber) {
      query.andWhere(
        `(project.round > :lastRound) OR 
          (project.round = :lastRound AND team.team_number > :lastTeamNumber)`,
        {
          lastRound: parseInt(lastRound),
          lastTeamNumber: parseInt(lastTeamNumber),
        },
      );
    }

    return await query.limit(parseInt(pageSize) + 1).getMany();
  }

  async findTeamsByProject(dto: PaginationTeamsByProjectDto) {
    const { projectId, pageSize, lastTeamNumber } = dto;

    const query = this.repo
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.project', 'project')
      .where('project.id = :projectId', { projectId })
      .orderBy('team.team_number', 'ASC');

    if (lastTeamNumber) {
      query.andWhere('team.team_number > :lastTeamNumber', {
        lastTeamNumber: parseInt(lastTeamNumber),
      });
    }

    return await query.limit(parseInt(pageSize) + 1).getMany();
  }
}
