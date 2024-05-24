import { Module } from '@nestjs/common';
import { TrackService } from './services/track.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './entities/track.entity';
import { TrackRepository } from './repositories/track.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Track])],
  providers: [TrackService, TrackRepository],
  exports: [TrackRepository, TrackService],
})
export class TrackModule {}
