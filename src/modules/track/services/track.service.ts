import { Injectable } from '@nestjs/common';
import { TrackRespository } from '../repositories';
import { TrackDto, TrackResDto } from '../dto';

@Injectable()
export class TrackService {
  constructor(private readonly trackRepo: TrackRespository) {}

  async createTrack(dto: TrackDto): Promise<TrackResDto> {
    return await this.trackRepo.createTrack(dto);
  }

  async updateTrack(trackId: string, dto: TrackDto): Promise<TrackResDto> {
    return await this.trackRepo.updateTrack(trackId, dto);
  }

  async deleteTrack() {}
}
