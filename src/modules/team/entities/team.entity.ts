import { BaseEntity } from 'src/common/entity';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { Officehour } from 'src/modules/officehour/entities/officehour.entity';
import { Project } from 'src/modules/project/entities';
import { User } from 'src/modules/user/entities';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity({ name: 'teams' })
export class Team extends BaseEntity {
  @Column({
    name: 'team_number',
  })
  teamNumber: number;

  @Column({ name: 'team_name', nullable: true })
  teamName: string;

  @Column()
  notion: string;

  @Column({ nullable: true })
  gitlab: string;

  @ManyToOne(() => Project, (project) => project.teams)
  project: Project;

  @ManyToMany(() => User, (user) => user.teams, { cascade: true })
  @JoinTable({
    name: 'team_user',
  })
  users: User[];

  @OneToMany(() => Officehour, (officehour) => officehour.team)
  officehours: Officehour[];

  @OneToOne(() => Chat, (chat) => chat.team) // Chat 엔티티와의 관계 설정
  chat: Chat;
}
