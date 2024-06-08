import { BaseEntity } from 'src/common/entity';
import { User } from 'src/modules/user/entities';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'notices' })
export class Notice extends BaseEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.notices)
  user: User;
}
