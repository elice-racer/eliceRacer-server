import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base-entity';
import { Track } from 'src/modules/track/entities/track.entity';
import { Team } from 'src/modules/team/entities/team.entity';

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

@Entity({ name: 'users' }) // 데이터베이스 테이블 이름은 스네이크 케이스
export class User extends BaseEntity {
  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ name: 'real_name' })
  realName: string;

  @Column({ name: 'phone_number', nullable: true, unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  comment: string;

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

  @ManyToOne(() => Track, (track) => track.users)
  track: Track | null;

  @ManyToMany(() => Team, (team) => team.users)
  teams: Team[];
}
