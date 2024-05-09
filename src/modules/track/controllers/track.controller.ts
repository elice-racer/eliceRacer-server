import { Controller } from '@nestjs/common';
import { TrackService } from '../services/track.service';

@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}
}
