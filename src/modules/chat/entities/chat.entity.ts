import { BaseEntity } from 'src/common/entity';
import { User } from 'src/modules/user/entities';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Message } from './message.entity';

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
}
