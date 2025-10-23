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

  @Column({ type: 'timestamp', nullable: true })
  lastUsernameChange: Date;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires: Date;

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

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'boolean', default: false })
  showNameInProfile: boolean;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  gender: string;

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
  clothingSize: string; // Konfektionsgröße

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

  // === PREISE ===

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price30Min: number; // 30 Minuten

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price1Hour: number; // 1 Stunde

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price2Hours: number; // 2 Stunden

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price3Hours: number; // 3 Stunden

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price6Hours: number; // 6 Stunden

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price12Hours: number; // 12 Stunden

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price24Hours: number; // 24 Stunden

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceOvernight: number; // Übernachtung

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceWeekend: number; // Wochenende

  // === RELATIONS ===
  
  @OneToMany(() => GalleryPhoto, (photo) => photo.user)
  galleryPhotos: GalleryPhoto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}