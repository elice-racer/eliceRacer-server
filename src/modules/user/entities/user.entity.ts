import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base-entity';

export type UserRole = 'admin' | 'racer' | 'coach';

@Entity()
export class Users extends BaseEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  github: string;

  @Column({ default: 'racer' })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isSessionValid: boolean;
}
