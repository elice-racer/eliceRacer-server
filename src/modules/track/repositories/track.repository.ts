import { EntityManager, Repository } from 'typeorm';
import { Track } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PaginationTrackByNameDto, PaginationTrackDto, TrackDto } from '../dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TrackRepository extends Repository<Track> {
  constructor(
    @InjectRepository(Track) private readonly repo: Repository<Track>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findAllTracks(dto: PaginationTrackDto) {
    const { pageSize, lastTrackName, lastCardinalNo } = dto;

    const query = this.repo
      .createQueryBuilder('track')
      .orderBy('track.trackName', 'ASC')
      .addOrderBy('track.cardinalNo', 'ASC');

    if (lastTrackName && lastCardinalNo) {
      query.andWhere(
        `(track.trackName > :lastTrackName) OR 
      (track.trackName = :lastTrackName AND track.cardinalNo > :lastCardinalNo) `,
        { lastTrackName, lastCardinalNo: parseInt(lastCardinalNo) },
      );
    }

    return await query.limit(parseInt(pageSize) + 1).getMany();
  }

  async findTracksByTrackName(dto: PaginationTrackByNameDto) {
    const { pageSize, trackName, lastCardinalNo } = dto;

    const query = this.repo
      .createQueryBuilder('track')
      .where(`track.trackName =:trackName`, { trackName })
      .orderBy('track.cardinalNo', 'ASC');

    if (lastCardinalNo) {
      query.andWhere(`track.cardinalNo > :lastCardinalNo `, {
        lastCardinalNo: parseInt(lastCardinalNo),
      });
    }

    return await query.limit(parseInt(pageSize) + 1).getMany();
  }

  async createTrack(dto: TrackDto): Promise<Track> {
    const track = new Track();

    track.trackName = dto.trackName;
    track.cardinalNo = dto.cardinalNo;

    return this.repo.save(track);
  }
}
