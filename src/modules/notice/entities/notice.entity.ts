import { BaseEntity } from 'src/common/entity';
import { User } from 'src/modules/user/entities';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'notices' })
export class Notice extends BaseEntity {
  @Column()
  title: string;

  @Column('varchar', { length: 1000 })
  content: string;

  @ManyToOne(() => User, (user) => user.notices, { onDelete: 'SET NULL' })
  user: User;
}
