import { BaseEntity } from 'src/common/entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Track extends BaseEntity {
  @Column()
  trackName: string;
  @Column()
  generation: string;
}
