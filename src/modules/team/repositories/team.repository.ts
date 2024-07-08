import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { PaginationAllTeamsDto } from '../dto';
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

  findAllTeams(dto: PaginationAllTeamsDto) {
    const {
      pageSize,
      trackName,
      cardinalNo,
      round,
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

    if (trackName !== 'ALL')
      query.andWhere('track.trackName = :trackName', { trackName });

    if (cardinalNo !== 0)
      query.andWhere('track.cardinalNo =:cardinalNo', { cardinalNo });

    if (round !== 0) query.andWhere('project.round = :round', { round });

    if (lastTrackName && lastCardinalNo && lastRound && lastTeamNumber) {
      query.andWhere(
        `(track.trackName > :lastTrackName) OR 
            (track.trackName = :lastTrackName AND track.cardinalNo > :lastCardinalNo) OR 
            (track.trackName = :lastTrackName AND track.cardinalNo = :lastCardinalNo AND project.round > :lastRound) OR
            (track.trackName = :lastTrackName AND track.cardinalNo = :lastCardinalNo AND project.round = :lastRound AND team.teamNumber > :lastTeamNumber)`,
        {
          lastTrackName,
          lastCardinalNo,
          lastRound,
          lastTeamNumber,
        },
      );
    }

    return query.limit(pageSize + 1).getMany();
  }
}
