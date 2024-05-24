import { HttpStatus, Injectable } from '@nestjs/common';
import { TrackRepository } from '../repositories';
import { TrackDto, TrackResDto } from '../dto';
import { BusinessException } from 'src/exception';

@Injectable()
export class TrackService {
  constructor(private readonly trackRepo: TrackRepository) {}

  async createTrack(dto: TrackDto): Promise<TrackResDto> {
    return await this.trackRepo.createTrack(dto);
  }

  async updateTrack(trackId: string, dto: TrackDto): Promise<TrackResDto> {
    const track = await this.trackRepo.findOneBy({ id: trackId });

    if (!track)
      throw new BusinessException(
        'track',
        `트랙을 찾을 수 없습니다.`,
        `트랙을 찾을 수 없습니다. 먼저 트랙을 생성하세요.`,
        HttpStatus.NOT_FOUND,
      );
    track.trackName = dto.trackName;

    return await this.trackRepo.save(track);
  }

  async deleteTrack() {}
}
