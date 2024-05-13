import { EntityManager, Repository } from 'typeorm';
import { Track } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { TrackDto } from '../dto';
import { NotFoundException } from '@nestjs/common';

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
    track.generation = dto.generation;

    return this.repo.save(track);
  }

  async updateTrack(trackId: string, dto: TrackDto): Promise<Track> {
    const track = await this.repo.findOneBy({ id: trackId });

    if (!track) throw new NotFoundException('트랙이 존재하지 않습니다');

    track.trackName = dto.trackName;
    track.generation = dto.generation;

    await this.repo.save(track);

    return track;
  }
}
