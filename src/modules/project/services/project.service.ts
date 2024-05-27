import { Injectable } from '@nestjs/common';
import { ProjectRepository } from '../repositories/project.repository';
import { TrackRepository } from 'src/modules/track/repositories';

@Injectable()
export class ProjectService {
  constructor(
    private readonly ProejctRepo: ProjectRepository,
    private readonly tarckRepo: TrackRepository,
  ) {}
}
