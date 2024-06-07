import { Controller, Get, Param, Query } from '@nestjs/common';
import { TrackService } from '../services/track.service';
import { ApiTags } from '@nestjs/swagger';
import {
  PaginationTrackByNameDto,
  PaginationTrackDto,
  TrackByCardinalReqDto,
} from '../dto';

@ApiTags('track')
@Controller('tracks')
export class TrackController {
  constructor(private readonly tracksService: TrackService) {}

  @Get('/:id')
  async getTrack(@Param('id') id: string) {
    return await this.tracksService.getTrack(id);
  }

  async getAllTracks(@Query() dto: PaginationTrackDto) {
    return await this.tracksService.getAllTracks(dto);
  }

  async getTracksByTrackName(@Query() dto: PaginationTrackByNameDto) {
    return await this.tracksService.getTracksByTrackName(dto);
  }

  async getTracksByCardinalNo(@Query() dto: TrackByCardinalReqDto) {
    return await this.tracksService.getTrackByCardinalNo(
      dto.trackName,
      dto.cardinalNo,
    );
  }
}
