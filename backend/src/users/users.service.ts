import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    // Hash das Passwort vor dem Speichern
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
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
}