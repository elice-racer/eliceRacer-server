import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base-entity';
import { Track } from 'src/modules/track/entities/track.entity';
import { Team } from 'src/modules/team/entities/team.entity';
import { Skill } from './skill.entity';
import { Notice } from 'src/modules/notice/entities/notice.entity';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { Message } from 'src/modules/chat/entities';
import { IsOptional, IsUrl } from 'class-validator';
import { DeviceToken } from 'src/modules/notification/entities/device-token.entity';

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

  @Column({
    nullable: true,
  })
  password: string;

  @Column({ name: 'real_name' })
  realName: string;

  @Column('varchar', {
    length: 11,
    name: 'phone_number',
    nullable: true,
    unique: true,
  })
  phoneNumber: string;

  @Column('varchar', { length: 100, nullable: true })
  comment: string;

  @Column('varchar', { length: 1000, nullable: true })
  description: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  github: string;

  @Column({ nullable: true })
  blog: string;

  @Column({ nullable: true })
  sns: string;

  @Column('varchar', { length: 1000, nullable: true })
  tmi: string;

  @Column({ nullable: true, name: 'profile_image' })
  @IsUrl()
  @IsOptional()
  profileImage: string;

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

  @ManyToMany(() => Skill, (skill) => skill.users)
  skills: Skill[];

  @OneToMany(() => Notice, (notice) => notice.user)
  notices: Notice[];

  @ManyToMany(() => Chat, (chat) => chat.users)
  chats: Chat[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => DeviceToken, (deviceToken) => deviceToken.user)
  tokens: DeviceToken[];
}
