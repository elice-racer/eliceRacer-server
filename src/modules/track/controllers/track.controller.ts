import { Controller, Get, Param, Query } from '@nestjs/common';
import { TrackService } from '../services/track.service';
import { ApiTags } from '@nestjs/swagger';
import { PaginationAllTracksDto } from '../dto/requesets/pagination-all-tracks.dto';

@ApiTags('track')
@Controller('tracks')
export class TrackController {
  constructor(private readonly tracksService: TrackService) {}

  @Get('/all')
  async getAllTracks(@Query() dto: PaginationAllTracksDto) {
    return await this.tracksService.getAllTracks(dto);
  }

  @Get('/:trackId')
  async getTrack(@Param('trackId') trackId: string) {
    return await this.tracksService.getTrack(trackId);
  }
}
