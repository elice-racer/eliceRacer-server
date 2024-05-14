import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base-entity';
import { Track } from 'src/modules/track/entities/track.entity';

export enum UserRole {
  RACER = 'RACER',
  COACH = 'COACH',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  UNVERIFIED = 0,
  VERIFIED = 1,
  VERIFIED_AND_REGISTERED = 2,
}
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  realName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  github: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.RACER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.UNVERIFIED,
  })
  status: UserStatus;

  @ManyToMany(() => Track)
  @JoinTable()
  tracks: Track[] | null;
}
