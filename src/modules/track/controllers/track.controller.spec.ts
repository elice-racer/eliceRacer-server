import { Test, TestingModule } from '@nestjs/testing';
import { TrackController } from './track.controller';
import { TrackService } from '../services/track.service';
import { TrackRespository } from '../repositories';

describe('TrackController', () => {
  let controller: TrackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackController],
      providers: [TrackService, TrackRespository],
    }).compile();

    controller = module.get<TrackController>(TrackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
