import { BaseEntity } from 'src/common/entity';
import { User } from 'src/modules/user/entities';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class DeviceToken extends BaseEntity {
  @Column()
  token: string;

  @ManyToOne(() => User, (user) => user.tokens)
  user: User;
}
