import { Module } from '@nestjs/common';
import { TrackController } from './controllers/track.controller';
import { TrackService } from './services/track.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './entities/track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Track])],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
