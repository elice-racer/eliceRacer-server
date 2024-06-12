import { BaseEntity } from 'src/common/entity';
import { User } from 'src/modules/user/entities';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Message } from './message.entity';
import { Team } from 'src/modules/team/entities/team.entity';

@Entity({ name: 'chats' })
export class Chat extends BaseEntity {
  @Column()
  chatName: string;

  @ManyToMany(() => User, (user) => user.chats, { cascade: true })
  @JoinTable({
    name: 'chat_user',
  })
  users: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @OneToOne(() => Team, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  team: Team | null;
}
