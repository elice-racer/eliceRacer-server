import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base-entity';
import { Track } from 'src/modules/track/entities/track.entity';

export type UserRole = 'admin' | 'racer' | 'coach';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  realName: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  github: string;

  @Column({ default: 'racer' })
  role: UserRole;

  @Column({ default: false })
  isSigned: boolean;

  @ManyToMany(() => Track)
  @JoinTable()
  tracks: Track[] | null;
}
