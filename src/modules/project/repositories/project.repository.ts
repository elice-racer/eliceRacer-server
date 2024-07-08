import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Project } from '../entities';
import { EntityManager, Repository } from 'typeorm';
import { PaginationAllProjectsDto } from '../dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectRepository extends Repository<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findAllProjects(dto: PaginationAllProjectsDto) {
    const {
      pageSize,
      trackName,
      cardinalNo,
      round,
      lastTrackName,
      lastCardinalNo,
      lastRound,
    } = dto;

    const query = this.repo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.track', 'track')
      .orderBy('track.trackName', 'ASC')
      .addOrderBy('track.cardinalNo', 'ASC')
      .addOrderBy('project.round', 'ASC');

    if (trackName !== 'ALL')
      query.andWhere('track.trackName =:trackName', { trackName });

    if (cardinalNo !== 0)
      query.andWhere('track.cardinalNo =: cardinalNo', { cardinalNo });

    if (round !== 0) query.andWhere('project.round =: round', { round });

    if (lastTrackName && lastCardinalNo && lastRound) {
      query.andWhere(
        `(track.trackName > :lastTrackName) OR 
      (track.trackName = :lastTrackName AND track.cardinalNo > :lastCardinalNo) OR 
      (track.trackName = :lastTrackName AND track.cardinalNo = :lastCardinalNo AND project.round > :lastRound)`,
        {
          lastTrackName,
          lastCardinalNo,
          lastRound,
        },
      );
    }

    return await query.limit(pageSize + 1).getMany();
  }
}
