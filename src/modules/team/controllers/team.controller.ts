import { Controller } from '@nestjs/common';
import { TeamService } from '../services/team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
}
