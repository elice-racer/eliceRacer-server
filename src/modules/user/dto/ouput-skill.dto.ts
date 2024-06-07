import { Expose } from 'class-transformer';

export class OutputSkillDto {
  @Expose()
  id: string;

  @Expose()
  skillName: string;
}
