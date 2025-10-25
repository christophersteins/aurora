import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('gallery_photos')
export class GalleryPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  photoUrl: string;

  @Column({ default: 0 })
  order: number; // For sorting photos

  @Column({ default: false })
  isFsk18: boolean; // Whether this media is FSK18 (adult content)

  @ManyToOne(() => User, (user) => user.galleryPhotos, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}