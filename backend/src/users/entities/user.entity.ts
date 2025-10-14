import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  // Geolocation-Feld für PostGIS
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326, // WGS84 (Standard für GPS-Koordinaten)
    nullable: true,
  })
  location: string; // GeoJSON oder WKT Format

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}