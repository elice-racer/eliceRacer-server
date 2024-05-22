import { BaseEntity } from 'src/common/entity';
import { Track } from 'src/modules/track/entities';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'projects' })
export class Project extends BaseEntity {
  @Column()
  projectName: string;

  @Column()
  round: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Track, (track) => track.projects)
  track: Track;
}
