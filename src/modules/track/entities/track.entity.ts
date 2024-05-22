import { BaseEntity } from 'src/common/entity';
import { User } from 'src/modules/user/entities';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity({ name: 'tracks' })
export class Track extends BaseEntity {
  @Column()
  trackName: string;

  @ManyToMany(() => User, (user) => user.tracks)
  users: User[];
}
