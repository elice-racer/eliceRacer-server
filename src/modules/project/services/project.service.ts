import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../repositories/project.repository';
import { CreateProjectDto } from '../dto';
import { TrackRepository } from 'src/modules/track/repositories';
import { BusinessException } from 'src/exception';

@Injectable()
export class ProjectService {
  constructor(
    private readonly ProejctRepo: ProjectRepository,
    private readonly tarckRepo: TrackRepository,
  ) {}

  async createProject(dto: CreateProjectDto) {
    const track = await this.tarckRepo.findOneBy({ trackName: dto.trackName });

    if (!track)
      throw new BusinessException(
        `project`,
        `트랙이 존재하지 않습니다 ${dto.trackName}`,
        `트랙이 존재하지 않습니다 ${dto.trackName} 트랙을 먼저 생성해주세요`,
        HttpStatus.NOT_FOUND,
      );

    return await this.ProejctRepo.createProject(dto, track);
  }
}
