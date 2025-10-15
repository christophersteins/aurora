import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }): Promise<User> {
    // Hash das Passwort
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Erstelle User mit allen Daten inklusive role
    const user = this.usersRepository.create({
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || UserRole.CUSTOMER, // Default: CUSTOMER
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
  ): Promise<User> {
    // Validierung
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // PostGIS Point im WKT-Format (Well-Known Text)
    const point = `SRID=4326;POINT(${longitude} ${latitude})`;

    // User aktualisieren
    const result = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ location: () => `ST_GeomFromText('${point}')` })
      .where('id = :userId', { userId })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Aktualisierten User zurückgeben
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async updateEscortProfile(
    userId: string,
    updateData: {
      birthDate?: string;
      nationalities?: string[];
      languages?: string[];
      height?: number;
      weight?: number;
      bodyType?: string;
      cupSize?: string;
      hairColor?: string;
      hairLength?: string;
      eyeColor?: string;
      hasTattoos?: boolean;
      hasPiercings?: boolean;
      description?: string;
    },
  ): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prüfe, ob User die Rolle ESCORT hat
    if (user.role !== UserRole.ESCORT) {
      throw new Error('Only users with ESCORT role can update escort profile');
    }

    // Konvertiere birthDate von string zu Date, falls vorhanden
    if (updateData.birthDate) {
      user.birthDate = new Date(updateData.birthDate);
    }

    // Aktualisiere die anderen Felder
    if (updateData.nationalities !== undefined) user.nationalities = updateData.nationalities;
    if (updateData.languages !== undefined) user.languages = updateData.languages;
    if (updateData.height !== undefined) user.height = updateData.height;
    if (updateData.weight !== undefined) user.weight = updateData.weight;
    if (updateData.bodyType !== undefined) user.bodyType = updateData.bodyType;
    if (updateData.cupSize !== undefined) user.cupSize = updateData.cupSize;
    if (updateData.hairColor !== undefined) user.hairColor = updateData.hairColor;
    if (updateData.hairLength !== undefined) user.hairLength = updateData.hairLength;
    if (updateData.eyeColor !== undefined) user.eyeColor = updateData.eyeColor;
    if (updateData.hasTattoos !== undefined) user.hasTattoos = updateData.hasTattoos;
    if (updateData.hasPiercings !== undefined) user.hasPiercings = updateData.hasPiercings;
    if (updateData.description !== undefined) user.description = updateData.description;

    return this.usersRepository.save(user);
  }

  async findUsersWithinRadius(
    latitude: number,
    longitude: number,
    radiusInKm: number,
    excludeUserId?: string,
  ): Promise<User[]> {
    const radiusInMeters = radiusInKm * 1000;

    let query = this.usersRepository
      .createQueryBuilder('user')
      .where(
        `ST_DWithin(
          user.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius
        )`,
        {
          latitude,
          longitude,
          radius: radiusInMeters,
        },
      )
      .andWhere('user.location IS NOT NULL');

    if (excludeUserId) {
      query = query.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    return query.getMany();
  }
}