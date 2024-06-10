import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import {
  PaginationTeamsByCardinalDto,
  PaginationTeamsByProjectDto,
  PaginationTeamsByTrackDto,
  PaginationTeamsDto,
} from '../dto';
import { Injectable } from '@nestjs/common';

@Injectable()
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
      .orderBy('track.trackName', 'ASC')
      .addOrderBy('track.cardinalNo', 'ASC')
      .addOrderBy('project.round', 'ASC')
      .addOrderBy('team.teamNumber', 'ASC');

    if (lastTrackName && lastCardinalNo && lastRound && lastTeamNumber) {
      query.andWhere(
        `(track.trackName > :lastTrackName) OR 
          (track.trackName = :lastTrackName AND track.cardinalNo > :lastCardinalNo) OR 
          (track.trackName = :lastTrackName AND track.cardinalNo = :lastCardinalNo AND project.round > :lastRound) OR
          (track.trackName = :lastTrackName AND track.cardinalNo = :lastCardinalNo AND project.round = :lastRound AND team.teamNumber > :lastTeamNumber)`,
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

    const query = this.repo
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.project', 'project')
      .leftJoinAndSelect('project.track', 'track')
      .where('track.trackName = :trackName', { trackName })
      .orderBy('track.cardinalNo', 'ASC')
      .addOrderBy('project.round', 'ASC')
      .addOrderBy('team.teamNumber', 'ASC');

    if (lastCardinalNo && lastRound && lastTeamNumber) {
      query.andWhere(
        `(track.cardinalNo > :lastCardinalNo) OR 
        (track.cardinalNo = :lastCardinalNo AND project.round > :lastRound) OR 
        (track.cardinalNo = :lastCardinalNo AND project.round = :lastRound AND team.teamNumber > :lastTeamNumber)`,
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
        'track.trackName = :trackName AND track.cardinalNo = :cardinalNo',
        { trackName, cardinalNo: parseInt(cardinalNo) },
      )
      .orderBy('project.round', 'ASC');

    if (lastRound && lastTeamNumber) {
      query.andWhere(
        `(project.round > :lastRound) OR 
          (project.round = :lastRound AND team.teamNumber > :lastTeamNumber)`,
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
      .orderBy('team.teamNumber', 'ASC');

    if (lastTeamNumber) {
      query.andWhere('team.teamNumber > :lastTeamNumber', {
        lastTeamNumber: parseInt(lastTeamNumber),
      });
    }

    return await query.limit(parseInt(pageSize) + 1).getMany();
  }
}
