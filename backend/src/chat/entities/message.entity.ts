import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @Column()
  senderId: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'varchar', nullable: true })
  mediaUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  mediaType?: string; // 'image' or 'video'

  @Column({ type: 'varchar', nullable: true })
  voiceUrl?: string;

  @Column({ type: 'integer', nullable: true })
  duration?: number; // Duration in seconds

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;
}