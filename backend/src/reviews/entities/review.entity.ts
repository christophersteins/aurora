import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User who wrote the review
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  reviewerId: string;

  // User being reviewed (typically an escort)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reviewedUserId' })
  reviewedUser: User;

  @Column()
  reviewedUserId: string;

  // Rating from 1 to 5 stars
  @Column({ type: 'int' })
  rating: number;

  // Optional text review
  @Column({ type: 'text', nullable: true })
  comment: string;

  // Track if review was edited
  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
