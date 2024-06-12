import { BaseEntity } from 'src/common/entity';
import { Project } from 'src/modules/project/entities';
import { Team } from 'src/modules/team/entities/team.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'officehours' })
export class Officehour extends BaseEntity {
  @Column()
  date: Date;

  @Column()
  coach: string;

  @ManyToOne(() => Team, (team) => team.officehours)
  team: Team;

  @ManyToOne(() => Project, (project) => project.officehours)
  project: Project;

  @Column()
  type: string;
}
