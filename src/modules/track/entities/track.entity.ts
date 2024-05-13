import { BaseEntity } from 'src/common/entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity({ name: 'tracks' })
@Unique(['trackName', 'generation'])
export class Track extends BaseEntity {
  @Column()
  trackName: string;
  @Column()
  generation: number;
}
