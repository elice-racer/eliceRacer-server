import { EntityManager, Repository } from 'typeorm';
import { Track } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { TrackDto } from '../dto';
import { HttpStatus } from '@nestjs/common';
import { BusinessException } from 'src/exception/BusinessException';

export class TrackRespository extends Repository<Track> {
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

    return this.repo.save(track);
  }

  async updateTrack(trackId: string, dto: TrackDto): Promise<Track> {
    const track = await this.repo.findOneBy({ id: trackId });

    if (!track)
      throw new BusinessException(
        'track',
        `트랙을 찾을 수 없습니다.`,
        `트랙을 찾을 수 없습니다. 먼저 트랙을 생성하세요.`,
        HttpStatus.NOT_FOUND,
      );
    track.trackName = dto.trackName;

    await this.repo.save(track);

    return track;
  }
}
