import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Artwork } from '../artworks/artwork.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  displayName?: string;

  // roles stored as comma-separated values like 'USER,SELLER'
  @Column({ default: 'USER' })
  roles: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Artwork, (artwork) => artwork.owner)
  artworks: Artwork[];
}
