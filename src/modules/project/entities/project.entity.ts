import { BaseEntity } from 'src/common/entity';
import { Officehour } from 'src/modules/officehour/entities/officehour.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { Track } from 'src/modules/track/entities';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'projects' })
export class Project extends BaseEntity {
  @Column({ name: 'project_name' })
  projectName: string;

  @Column()
  round: number;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @ManyToOne(() => Track, (track) => track.projects)
  track: Track;

  @OneToMany(() => Officehour, (officehour) => officehour.project, {
    onDelete: 'SET NULL',
  })
  officehours: Officehour[] | null;

  @OneToMany(() => Team, (team) => team.project, {
    onDelete: 'RESTRICT',
  })
  teams: Team[];
}
