import { BaseEntity } from 'src/common/entity';
import { User } from 'src/modules/user/entities';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Chat } from './chat.entity';

@Entity({ name: 'messages' })
export class Message extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.messages)
  user: User;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;
}
