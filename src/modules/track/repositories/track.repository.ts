import { EntityManager, Repository } from 'typeorm';
import { Track } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { TrackDto } from '../dto';

export class TrackRepository extends Repository<Track> {
  constructor(
    @InjectRepository(Track) private readonly repo: Repository<Track>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createTrack(dto: TrackDto): Promise<Track> {
    const track = new Track();

    track.trackName = dto.trackName;
    track.cardinalNo = dto.cardinalNo;

    return this.repo.save(track);
  }
}
