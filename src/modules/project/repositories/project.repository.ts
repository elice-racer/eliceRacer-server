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
      .orderBy('track.track_name', 'ASC')
      .addOrderBy('track.cardinal_no', 'ASC')
      .addOrderBy('project.round', 'ASC');

    if (lastTrackName && lastCardinalNo && lastRound) {
      query.andWhere(
        `(track.track_name > :lastTrackName) OR 
        (track.track_name = :lastTrackName AND track.cardinal_no > :lastCardinalNo) OR 
        (track.track_name = :lastTrackName AND track.cardinal_no = :lastCardinalNo AND project.round > :lastRound)`,
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
      .where('track.track_name = :trackName', { trackName })
      .orderBy('track.cardinal_no', 'ASC')
      .addOrderBy('project.round', 'ASC');

    if (lastCardinalNo && lastRound) {
      query.andWhere(
        `(track.cardinal_no > :lastCardinalNo) OR 
        (track.cardinal_no = :lastCardinalNo AND project.round > :lastRound)`,
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
      .where('track.track_name = :trackName', { trackName })
      .andWhere('track.cardinal_no = :cardinalNo', {
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
