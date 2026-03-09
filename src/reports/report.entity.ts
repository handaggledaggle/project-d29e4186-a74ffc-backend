import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'reports' })
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reporterId: string;

  @Column()
  targetType: string;

  @Column()
  targetId: string;

  @Column()
  reasonCode: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ default: 'RECEIVED' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
