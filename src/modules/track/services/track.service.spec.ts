import { Test, TestingModule } from '@nestjs/testing';
import { TrackService } from './track.service';
import { TrackDto, TrackResDto } from '../dto';
import { TrackRespository } from '../repositories/track.repository';
import { Track } from '../entities';

describe('TrackService', () => {
  let service: TrackService;
  let trackRepo: jest.Mocked<TrackRespository>;
  const dto: TrackDto = {
    trackName: 'Track',
    generation: '1',
  };

  const resDto: TrackResDto = {
    trackName: 'Track',
    generation: '1',
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
      track.trackName = resDto.trackName;
      track.generation = resDto.generation;

      trackRepo.createTrack.mockResolvedValue(track);
      const result = await service.createTrack(dto);

      expect(result).toEqual(resDto);
    });
  });

  describe('updateTrack', () => {
    it('track을 업데이트 한다', async () => {
      const track = new Track();
      track.trackName = resDto.trackName;
      track.generation = resDto.generation;
      trackRepo.updateTrack.mockResolvedValue(track);

      const result = await service.updateTrack('trackId', dto);

      expect(result).toEqual(resDto);
    });
  });
});
