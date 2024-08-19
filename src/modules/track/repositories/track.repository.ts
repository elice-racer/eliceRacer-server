import { EntityManager, Repository } from 'typeorm';
import { Track } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PaginationAllTracksDto, TrackDto } from '../dto';
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

  async findAllTracks(dto: PaginationAllTracksDto) {
    const { pageSize, trackName, cardinalNo, lastTrackName, lastCardinalNo } =
      dto;

    const query = this.repo
      .createQueryBuilder('track')
      .orderBy('track.trackName', 'ASC')
      .addOrderBy('track.cardinalNo', 'ASC');

    if (trackName !== 'ALL')
      query.andWhere('track.trackName = :trackName', { trackName });

    if (cardinalNo !== 0)
      query.andWhere('track.cardinalNo = :cardinalNo', { cardinalNo });

    if (lastTrackName && lastCardinalNo) {
      query.andWhere(
        `(track.trackName > :lastTrackName) OR 
        (track.trackName = :lastTrackName AND track.cardinalNo > :lastCardinalNo) `,
        { lastTrackName, lastCardinalNo },
      );
    }

    return query.limit(pageSize + 1).getMany();
  }

  async createTrack(dto: TrackDto): Promise<Track> {
    const track = new Track();

    track.trackName = dto.trackName;
    track.cardinalNo = dto.cardinalNo;

    return this.repo.save(track);
  }
}
