import { HttpStatus, Injectable } from '@nestjs/common';
import { TrackRepository } from '../repositories';
import {
  PaginationTrackByNameDto,
  PaginationTrackDto,
  TrackDto,
  TrackResDto,
} from '../dto';
import { BusinessException } from 'src/exception';
import { ConfigService } from '@nestjs/config';
import { ENV_SERVER_URL_KEY } from 'src/common/const';

@Injectable()
export class TrackService {
  private baseUrl;
  constructor(
    private readonly trackRepo: TrackRepository,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>(ENV_SERVER_URL_KEY);
  }

  async getTrack(id: string) {
    const track = await this.trackRepo.findOneBy({ id });
    if (!track)
      throw new BusinessException(
        `track`,
        `해당 트랙이 존재하지 않습니다.`,
        `해당 트랙이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    return track;
  }

  async getTrackByCardinalNo(trackName: string, cardinalNo: string) {
    const track = await this.trackRepo.findOne({
      where: { trackName, cardinalNo: parseInt(cardinalNo) },
    });

    if (!track)
      throw new BusinessException(
        `track`,
        `해당 트랙이 존재하지 않습니다.`,
        `해당 트랙이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );

    return track;
  }

  async getAllTracks(dto: PaginationTrackDto) {
    const { pageSize } = dto;

    const tracks = await this.trackRepo.findAllTracks(dto);

    let next: string | null = null;

    if (tracks.length > parseInt(pageSize)) {
      const lastTrack = tracks[parseInt(pageSize) - 1];
      next = `${this.baseUrl}/api/tracks/all?pageSize=${pageSize}&lastTrackName=${lastTrack.trackName}&lastCardinalNo=${lastTrack.cardinalNo}`;
      tracks.pop();
    }
    return { tracks, pagination: { next, count: tracks.length } };
  }

  async getTracksByTrackName(dto: PaginationTrackByNameDto) {
    const { pageSize, trackName } = dto;

    const tracks = await this.trackRepo.findTracksByTrackName(dto);

    let next: string | null = null;

    if (tracks.length > parseInt(pageSize)) {
      const lastTrack = tracks[parseInt(pageSize) - 1];
      next = `${this.baseUrl}/api/tracks/all?pageSize=${pageSize}&trackName=${trackName}&lastCardinalNo=${lastTrack.cardinalNo}`;
      tracks.pop();
    }
    return { tracks, pagination: { next, count: tracks.length } };
  }

  async createTrack(dto: TrackDto): Promise<TrackResDto> {
    const track = await this.trackRepo.findOne({
      where: { trackName: dto.trackName, cardinalNo: dto.cardinalNo },
    });

    if (track)
      throw new BusinessException(
        'track',
        `해당 트랙(${dto.trackName}${dto.cardinalNo})이 이미 존재합니다.`,
        `해당 트랙(${dto.trackName}${dto.cardinalNo})이 이미 존재합니다.`,
        HttpStatus.CONFLICT,
      );
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

  async deleteTrack(trackId: string) {
    const track = await this.trackRepo.findOne({
      where: { id: trackId },
      relations: ['projects'],
    });

    if (!track)
      throw new BusinessException(
        'track',
        `트랙을 찾을 수 없습니다.`,
        `트랙을 찾을 수 없습니다.`,
        HttpStatus.NOT_FOUND,
      );

    if (track.projects)
      throw new BusinessException(
        'track',
        `프로젝트가 존재하는 트랙은 삭제할 수 없습니다.`,
        `프로젝트가 존재하는 트랙은 삭제할 수 없습니다.`,
        HttpStatus.BAD_REQUEST,
      );

    await this.trackRepo.remove(track);
  }
}
