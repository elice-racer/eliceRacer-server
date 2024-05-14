import { BaseEntity } from 'src/common/entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'tracks' })
export class Track extends BaseEntity {
  @Column()
  trackName: string;
}
