import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { GalleryPhoto } from './gallery-photo.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  ESCORT = 'escort',
  BUSINESS = 'business',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  location: string;

  // Escort-spezifische Felder
  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'simple-array', nullable: true })
  nationalities: string[];

  @Column({ type: 'simple-array', nullable: true })
  languages: string[];

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @Column({ nullable: true })
  bodyType: string;

  @Column({ nullable: true })
  cupSize: string;

  @Column({ nullable: true })
  hairColor: string;

  @Column({ nullable: true })
  hairLength: string;

  @Column({ nullable: true })
  eyeColor: string;

  @Column({ nullable: true })
  intimateHair: string;

  @Column({ default: false })
  hasTattoos: boolean;

  @Column({ default: false })
  hasPiercings: boolean;

  @Column({ default: false })
  isSmoker: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Gallery Photos Relation
  @OneToMany(() => GalleryPhoto, (photo) => photo.user, { eager: true })
  galleryPhotos: GalleryPhoto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}