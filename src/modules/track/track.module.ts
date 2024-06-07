import { Module } from '@nestjs/common';
import { TrackService } from './services/track.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './entities/track.entity';
import { TrackRepository } from './repositories/track.repository';
import { TrackController } from './controllers/track.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Track])],
  providers: [TrackService, TrackRepository],
  exports: [TrackRepository, TrackService],
  controllers: [TrackController],
})
export class TrackModule {}
