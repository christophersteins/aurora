import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum ReportCategory {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  FAKE_PROFILE = 'fake_profile',
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  SCAM = 'scam',
  UNDERAGE = 'underage',
  OTHER = 'other',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column({ nullable: true })
  reporterId: string | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser: User;

  @Column()
  reportedUserId: string;

  @Column({
    type: 'enum',
    enum: ReportCategory,
  })
  category: ReportCategory;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;
}
