import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { GalleryPhoto } from './gallery-photo.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profilePicture: string;

  // Benutzerrolle - optional da Default-Wert vorhanden
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role?: UserRole;

  // Geolocation-Feld für PostGIS
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
    transformer: {
      to: (value: any) => value,
      from: (value: any) => {
        if (!value) return null;
        // If already an object with coordinates, return as-is
        if (typeof value === 'object' && value.coordinates) {
          return value;
        }
        // Otherwise return the raw value
        return value;
      },
    },
  })
  location: any;

  // === ESCORT-SPEZIFISCHE FELDER ===
  
  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column('text', { array: true, nullable: true })
  nationalities: string[];

  @Column('text', { array: true, nullable: true })
  languages: string[];

  @Column({ nullable: true })
  type: string; // Typ (Afrikanisch, Asiatisch, etc.)

  @Column({ type: 'int', nullable: true })
  height: number; // in cm

  @Column({ type: 'int', nullable: true })
  weight: number; // in kg

  @Column({ nullable: true })
  bodyType: string; // Figur

  @Column({ nullable: true })
  cupSize: string; // Oberweite

  @Column({ nullable: true })
  hairColor: string;

  @Column({ nullable: true })
  hairLength: string;

  @Column({ nullable: true })
  eyeColor: string;

  @Column({ nullable: true })
  intimateHair: string; // Intimbereich

  @Column({ type: 'boolean', default: false })
  hasTattoos: boolean;

  @Column({ type: 'boolean', default: false })
  hasPiercings: boolean;

  @Column({ type: 'boolean', default: false })
  isSmoker: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  // === RELATIONS ===
  
  @OneToMany(() => GalleryPhoto, (photo) => photo.user)
  galleryPhotos: GalleryPhoto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}