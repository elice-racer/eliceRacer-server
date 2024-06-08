import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Project } from '../entities';
import { EntityManager, Repository } from 'typeorm';
import { PaginationProjectsByTrackDto, PaginationProjectsDto } from '../dto';
import { PaginationProjectsByCardinalDto } from '../dto/pagination-projects-by-carinal.dto';

export class ProjectRepository extends Repository<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findAllProjects(dto: PaginationProjectsDto): Promise<Project[]> {
    const { lastTrackName, lastCardinalNo, lastRound, pageSize } = dto;

    const query = this.repo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.track', 'track')
      .orderBy('track.trackName', 'ASC')
      .addOrderBy('track.cardinalNo', 'ASC')
      .addOrderBy('project.round', 'ASC');

    if (lastTrackName && lastCardinalNo && lastRound) {
      query.andWhere(
        `(track.trackName > :lastTrackName) OR 
        (track.trackName = :lastTrackName AND track.cardinalNo > :lastCardinalNo) OR 
        (track.trackName = :lastTrackName AND track.cardinalNo = :lastCardinalNo AND project.round > :lastRound)`,
        {
          lastTrackName,
          lastCardinalNo: parseInt(lastCardinalNo),
          lastRound: parseInt(lastRound),
        },
      );
    }

    return await query.limit(parseInt(pageSize) + 1).getMany();
  }
  async findProjectsByTrack(dto: PaginationProjectsByTrackDto) {
    const { pageSize, trackName, lastCardinalNo, lastRound } = dto;

    const pageSizeToInt = parseInt(pageSize);

    const query = this.repo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.track', 'track')
      .where('track.trackName = :trackName', { trackName })
      .orderBy('track.cardinalNo', 'ASC')
      .addOrderBy('project.round', 'ASC');

    if (lastCardinalNo && lastRound) {
      query.andWhere(
        `(track.cardinalNo > :lastCardinalNo) OR 
        (track.cardinalNo = :lastCardinalNo AND project.round > :lastRound)`,
        { lastCardinalNo, lastRound },
      );
    }

    return await query.limit(pageSizeToInt + 1).getMany();
  }

  async findProjectsByTrackAndCardinalNo(
    dto: PaginationProjectsByCardinalDto,
  ): Promise<Project[]> {
    const { trackName, cardinalNo, lastRound, pageSize } = dto;

    const query = this.repo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.track', 'track')
      .where('track.trackName = :trackName', { trackName })
      .andWhere('track.cardinalNo = :cardinalNo', {
        cardinalNo: parseInt(cardinalNo),
      })
      .orderBy('project.round', 'ASC');

    if (lastRound !== undefined) {
      query.andWhere('project.round > :lastRound', {
        lastRound: parseInt(lastRound),
      });
    }

    if (lastRound) {
      query.andWhere('project.round > :lastRound', { lastRound });
    }

    return await query.limit(parseInt(pageSize) + 1).getMany();
  }
}
