import { Module } from '@nestjs/common';
import { TrackService } from './services/track.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './entities/track.entity';
import { TrackRespository } from './repositories/track.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Track])],
  providers: [TrackService, TrackRespository],
  exports: [TrackRespository, TrackService],
})
export class TrackModule {}
