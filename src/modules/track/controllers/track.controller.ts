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

  @Get('/:trackId')
  async getTrack(@Param('trackId') trackId: string) {
    return await this.tracksService.getTrack(trackId);
  }

  @Get('/all')
  async getAllTracks(@Query() dto: PaginationTrackDto) {
    return await this.tracksService.getAllTracks(dto);
  }

  @Get('/names/all')
  async getTracksByTrackName(@Query() dto: PaginationTrackByNameDto) {
    return await this.tracksService.getTracksByTrackName(dto);
  }

  @Get('/cardinals/all')
  async getTracksByCardinalNo(@Query() dto: TrackByCardinalReqDto) {
    return await this.tracksService.getTrackByCardinalNo(
      dto.trackName,
      dto.cardinalNo,
    );
  }
}
