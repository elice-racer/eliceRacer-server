import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrackService } from '../services/track.service';
import { TrackDto, TrackResDto } from '../dto';
import { AdminGuard } from 'src/common/guards';
import { ResponseInterceptor, Serialize } from 'src/interceptors';

@UseInterceptors(ResponseInterceptor)
@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Post()
  @UseGuards(AdminGuard)
  @Serialize(TrackResDto)
  async createTrack(@Body() dto: TrackDto) {
    return await this.trackService.createTrack(dto);
  }
}
