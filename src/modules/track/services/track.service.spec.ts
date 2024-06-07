import { Test, TestingModule } from '@nestjs/testing';
import { TrackService } from './track.service';
import { TrackDto, TrackResDto } from '../dto';
import { TrackRepository } from '../repositories/track.repository';
import { Track } from '../entities';
import { BusinessException } from 'src/exception';
import { ConfigService } from '@nestjs/config';

describe('TrackService', () => {
  let service: TrackService;
  let trackRepo: jest.Mocked<TrackRepository>;
  const dto: TrackDto = {
    trackName: 'Track',
    cardinalNo: 1,
  };

  const resDto: TrackResDto = {
    id: 'uuid',
    trackName: 'Track',
    cardinalNo: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackService, TrackRepository, ConfigService],
    }).compile();

    service = module.get<TrackService>(TrackService);
    trackRepo = module.get(TrackRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTrack', () => {
    const trackId = 'uuid';
    it('트랙이 존재하지 않으면 BusinessException을 던진다', async () => {
      trackRepo.findOneBy.mockResolvedValue(undefined);

      await expect(service.getTrack(trackId)).rejects.toThrow(
        BusinessException,
      );
    });

    it('트랙이 존재하면 해당 트랙을 반환한다', async () => {
      const track = new Track();

      trackRepo.findOneBy.mockResolvedValue(track);

      const result = await service.getTrack(trackId);

      expect(result).toEqual(track);
    });
  });
  describe('createTrack', () => {
    it('해당 track이 이미 존재하면 BusinessException을 던진다', async () => {
      const track = new Track();

      trackRepo.findOne.mockResolvedValue(track);

      await expect(service.createTrack(dto)).rejects.toThrow(BusinessException);
    });
    it('track을 생성한다', async () => {
      const track = new Track();
      track.id = 'uuid';
      track.trackName = resDto.trackName;
      track.cardinalNo = dto.cardinalNo;

      trackRepo.createTrack.mockResolvedValue(track);
      const result = await service.createTrack(dto);

      expect(result).toEqual(resDto);
    });
  });

  describe('updateTrack', () => {
    it('track이 존재하지 않으면 businessException을 반환한다', async () => {
      trackRepo.findOneBy.mockResolvedValue(undefined);

      await expect(service.updateTrack('uuid', dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('track을 업데이트 한다', async () => {
      const track = new Track();
      track.id = 'uuid';
      track.trackName = dto.trackName;
      track.cardinalNo = dto.cardinalNo;

      trackRepo.findOneBy.mockResolvedValue(track);
      trackRepo.save.mockResolvedValue(track);
      const result = await service.updateTrack('trackId', dto);

      expect(result).toEqual(resDto);
    });
  });
});
