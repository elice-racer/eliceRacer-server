import { Test, TestingModule } from '@nestjs/testing';
import { TrackService } from './track.service';
import { TrackDto, TrackResDto } from '../dto';
import { TrackRespository } from '../repositories/track.repository';
import { Track } from '../entities';
import { BusinessException } from 'src/exception';

describe('TrackService', () => {
  let service: TrackService;
  let trackRepo: jest.Mocked<TrackRespository>;
  const dto: TrackDto = {
    trackName: 'Track1',
  };

  const resDto: TrackResDto = {
    id: 'uuid',
    trackName: 'Track1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackService, TrackRespository],
    }).compile();

    service = module.get<TrackService>(TrackService);
    trackRepo = module.get(TrackRespository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTrack', () => {
    it('track을 생성한다', async () => {
      const track = new Track();
      track.id = 'uuid';
      track.trackName = resDto.trackName;

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

      trackRepo.findOneBy.mockResolvedValue(track);
      trackRepo.save.mockResolvedValue(track);
      const result = await service.updateTrack('trackId', dto);

      expect(result).toEqual(resDto);
    });
  });
});
