import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TrackService } from '../services/track.service';
import { TrackDto } from '../dto';
import { AdminGuard } from 'src/common/guards';

@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Post()
  @UseGuards(AdminGuard)
  async createTrack(@Body() dto: TrackDto) {
    return await this.trackService.createTrack(dto);
  }
}
