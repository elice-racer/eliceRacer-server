import { BaseEntity } from 'src/common/entity';
import { Project } from 'src/modules/project/entities';
import { User } from 'src/modules/user/entities';
import { Column, Entity, OneToMany, Unique } from 'typeorm';

@Unique(['trackName', 'cardinalNo'])
@Entity({ name: 'tracks' })
export class Track extends BaseEntity {
  @Column({
    name: 'track_name',
  })
  trackName: string;

  @Column({ name: 'cardinal_no' })
  cardinalNo: number;

  @OneToMany(() => User, (user) => user.track)
  users: User[];

  @OneToMany(() => Project, (project) => project.track, {
    onDelete: 'SET NULL',
  })
  projects: Project[];
}
