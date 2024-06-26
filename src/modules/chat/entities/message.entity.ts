import { BaseEntity } from 'src/common/entity';
import { User } from 'src/modules/user/entities';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Chat } from './chat.entity';

@Entity({ name: 'messages' })
export class Message extends BaseEntity {
  @Column('varchar', { length: 500 })
  content: string;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;
}
