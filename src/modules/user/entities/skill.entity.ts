import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/common/entity';

@Entity({ name: 'skills' })
export class Skill extends BaseEntity {
  @Column({ name: 'skill_name', unique: true })
  skillName: string;

  @ManyToMany(() => User, (user) => user.skills)
  @JoinTable({
    name: 'skill_user',
  })
  users: User[];
}
