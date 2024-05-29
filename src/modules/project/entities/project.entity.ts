import { BaseEntity } from 'src/common/entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { Track } from 'src/modules/track/entities';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'projects' })
export class Project extends BaseEntity {
  @Column({ name: 'project_name' })
  projectName: string;

  @Column()
  round: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Track, (track) => track.projects)
  track: Track;

  @OneToMany(() => Team, (team) => team.project, {
    onDelete: 'RESTRICT',
  })
  teams: Team[];
}
