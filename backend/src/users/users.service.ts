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
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user with all data including role
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

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'createdAt'],
    });
  }

  async findAllEscorts(): Promise<User[]> {
    // Use query builder to properly serialize PostGIS geometry as GeoJSON
    const escorts = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.profilePicture',
        'user.role',
        'user.birthDate',
        'user.nationalities',
        'user.languages',
        'user.type',
        'user.height',
        'user.weight',
        'user.bodyType',
        'user.cupSize',
        'user.hairColor',
        'user.hairLength',
        'user.eyeColor',
        'user.intimateHair',
        'user.hasTattoos',
        'user.hasPiercings',
        'user.isSmoker',
        'user.description',
        'user.createdAt',
        'user.updatedAt',
      ])
      .addSelect('ST_AsGeoJSON(user.location)::json', 'location')
      .where('user.role = :role', { role: UserRole.ESCORT })
      .getRawAndEntities();

    // Map the raw location data to the entities
    return escorts.entities.map((entity, index) => {
      const rawLocation = escorts.raw[index]?.location;
      if (rawLocation) {
        entity.location = rawLocation;
      }
      return entity;
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { username: username.toLowerCase() } 
    });
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
    // Validation
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // PostGIS Point in WKT format (Well-Known Text)
    const point = `SRID=4326;POINT(${longitude} ${latitude})`;

    // Update user
    const result = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ location: () => `ST_GeomFromText('${point}')` })
      .where('id = :userId', { userId })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Return updated user
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async updateEscortProfile(
    userId: string,
    updateData: {
      name?: string;
      showNameInProfile?: boolean;
      birthDate?: string;
      nationalities?: string[];
      languages?: string[];
      type?: string;
      height?: number;
      weight?: number;
      bodyType?: string;
      cupSize?: string;
      hairColor?: string;
      hairLength?: string;
      eyeColor?: string;
      intimateHair?: string;
      hasTattoos?: boolean;
      hasPiercings?: boolean;
      isSmoker?: boolean;
      description?: string;
    },
  ): Promise<User> {
    console.log('updateEscortProfile called for user:', userId);
    console.log('Update data:', JSON.stringify(updateData, null, 2));

    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has ESCORT role
    if (user.role !== UserRole.ESCORT) {
      throw new Error('Only users with ESCORT role can update escort profile');
    }

    // Update name and toggle
    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.showNameInProfile !== undefined) user.showNameInProfile = updateData.showNameInProfile;

    // Convert birthDate from string to Date if present
    if (updateData.birthDate !== undefined) {
      user.birthDate = new Date(updateData.birthDate);
    }

    // Update other fields
    if (updateData.nationalities !== undefined) user.nationalities = updateData.nationalities;
    if (updateData.languages !== undefined) user.languages = updateData.languages;
    if (updateData.type !== undefined) user.type = updateData.type;
    if (updateData.height !== undefined) user.height = updateData.height;
    if (updateData.weight !== undefined) user.weight = updateData.weight;
    if (updateData.bodyType !== undefined) user.bodyType = updateData.bodyType;
    if (updateData.cupSize !== undefined) user.cupSize = updateData.cupSize;
    if (updateData.hairColor !== undefined) user.hairColor = updateData.hairColor;
    if (updateData.hairLength !== undefined) user.hairLength = updateData.hairLength;
    if (updateData.eyeColor !== undefined) user.eyeColor = updateData.eyeColor;
    if (updateData.intimateHair !== undefined) user.intimateHair = updateData.intimateHair;
    if (updateData.hasTattoos !== undefined) user.hasTattoos = updateData.hasTattoos;
    if (updateData.hasPiercings !== undefined) user.hasPiercings = updateData.hasPiercings;
    if (updateData.isSmoker !== undefined) user.isSmoker = updateData.isSmoker;
    if (updateData.description !== undefined) user.description = updateData.description;

    console.log('User data after update (before save):', {
      id: user.id,
      birthDate: user.birthDate,
      height: user.height,
      weight: user.weight,
      bodyType: user.bodyType,
      cupSize: user.cupSize,
    });

    // Save and reload to ensure we get the latest data
    await this.usersRepository.save(user);

    // Reload the user from database to ensure we have the latest data
    const reloadedUser = await this.findById(userId);

    if (!reloadedUser) {
      throw new NotFoundException('User not found after save');
    }

    console.log('User reloaded from database:', {
      id: reloadedUser.id,
      birthDate: reloadedUser.birthDate,
      height: reloadedUser.height,
      weight: reloadedUser.weight,
      bodyType: reloadedUser.bodyType,
      cupSize: reloadedUser.cupSize,
    });

    return reloadedUser;
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

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }
}