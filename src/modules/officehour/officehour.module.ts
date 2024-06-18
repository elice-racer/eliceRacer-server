import { Module } from '@nestjs/common';
import { OfficehourController } from './controllers/officehour.controller';
import { OfficehourService } from './services/officehour.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Officehour } from './entities/officehour.entity';
import { OfficehourRepository } from './repositories/officehour.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Officehour])],
  controllers: [OfficehourController],
  providers: [OfficehourService, OfficehourRepository],
  exports: [OfficehourService, OfficehourRepository],
})
export class OfficehourModule {}
