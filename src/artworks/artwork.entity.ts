import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'artworks' })
export class Artwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // simple comma separated tags
  @Column({ nullable: true })
  tags?: string;

  @Index()
  @Column({ nullable: true })
  category?: string;

  @Column('numeric')
  price: number;

  // files stored as JSON { original_url, thumbnail_url }
  @Column({ type: 'json', nullable: true })
  files?: any;

  @ManyToOne(() => User, (user) => user.artworks, { nullable: false })
  owner: User;

  @Column({ default: 'PUBLIC' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
