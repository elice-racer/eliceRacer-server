import { BaseEntity } from 'src/common/entity';
import { Project } from 'src/modules/project/entities';
import { User } from 'src/modules/user/entities';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'tracks' })
export class Track extends BaseEntity {
  @Column()
  trackName: string;

  @Column()
  cardinalNo: string;

  @OneToMany(() => User, (user) => user.track, { onDelete: 'RESTRICT' })
  users: User[];

  @OneToMany(() => Project, (project) => project.track, {
    onDelete: 'RESTRICT',
  })
  projects: Project[];
}
