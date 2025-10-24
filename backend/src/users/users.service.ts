import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
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
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    emailVerified?: boolean;
  }): Promise<User> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user with all data including role and email verification fields
    const user = this.usersRepository.create({
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || UserRole.CUSTOMER, // Default: CUSTOMER
      emailVerificationToken: userData.emailVerificationToken,
      emailVerificationExpires: userData.emailVerificationExpires,
      emailVerified: userData.emailVerified ?? false,
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
        'user.gender',
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
      gender?: string;
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
      services?: string[];
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

    // Update gender
    if (updateData.gender !== undefined) user.gender = updateData.gender;

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
    if (updateData.services !== undefined) user.services = updateData.services;
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

  async updateUsername(userId: string, newUsername: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if username change is allowed (90 days restriction)
    if (user.lastUsernameChange) {
      const daysSinceLastChange = Math.floor(
        (Date.now() - new Date(user.lastUsernameChange).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastChange < 90) {
        const daysRemaining = 90 - daysSinceLastChange;
        throw new BadRequestException(
          `Username can only be changed once every 90 days. You can change it again in ${daysRemaining} days.`
        );
      }
    }

    // Check if username is already taken
    const existingUser = await this.findByUsername(newUsername);
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Username is already taken');
    }

    user.username = newUsername.toLowerCase();
    user.lastUsernameChange = new Date();

    return this.usersRepository.save(user);
  }

  async updateEmail(userId: string, newEmail: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already taken
    const existingUser = await this.findByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Email is already taken');
    }

    user.email = newEmail;

    return this.usersRepository.save(user);
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.validatePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    return this.usersRepository.save(user);
  }

  async canChangeUsername(userId: string): Promise<{ canChange: boolean; daysRemaining?: number }> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.lastUsernameChange) {
      return { canChange: true };
    }

    const daysSinceLastChange = Math.floor(
      (Date.now() - new Date(user.lastUsernameChange).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastChange < 90) {
      return {
        canChange: false,
        daysRemaining: 90 - daysSinceLastChange
      };
    }

    return { canChange: true };
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { emailVerificationToken: token }
    });
  }

  async verifyEmail(userId: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null as any;
    user.emailVerificationExpires = null as any;

    return this.usersRepository.save(user);
  }

  async updateVerificationToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.emailVerificationToken = token;
    user.emailVerificationExpires = expires;

    return this.usersRepository.save(user);
  }

  async completeRegistration(
    userId: string,
    username: string,
    password: string,
    role: string
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with new data and mark as verified
    user.username = username.toLowerCase();
    user.password = hashedPassword;
    user.role = role as UserRole;
    user.emailVerified = true;
    user.emailVerificationToken = null as any;
    user.emailVerificationExpires = null as any;

    return this.usersRepository.save(user);
  }

  async updateProfile(
    userId: string,
    updateData: { username?: string; firstName?: string; lastName?: string }
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if username is being changed and if it's already taken
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateData.username.toLowerCase() }
      });

      if (existingUser) {
        throw new BadRequestException('Username already taken');
      }

      user.username = updateData.username.toLowerCase();
    }

    // Update other fields
    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName;
    }

    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName;
    }

    const updatedUser = await this.usersRepository.save(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  // Bookmark / Merkliste methods
  async addBookmark(userId: string, escortId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Initialize bookmarkedEscorts if null
    if (!user.bookmarkedEscorts) {
      user.bookmarkedEscorts = [];
    }

    // Check if already bookmarked
    if (!user.bookmarkedEscorts.includes(escortId)) {
      user.bookmarkedEscorts.push(escortId);
      await this.usersRepository.save(user);
    }
  }

  async removeBookmark(userId: string, escortId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.bookmarkedEscorts) {
      user.bookmarkedEscorts = user.bookmarkedEscorts.filter(
        (id) => id !== escortId,
      );
      await this.usersRepository.save(user);
    }
  }

  async getBookmarkedEscorts(userId: string): Promise<User[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.bookmarkedEscorts || user.bookmarkedEscorts.length === 0) {
      return [];
    }

    // Fetch all bookmarked escorts
    const escorts = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids: user.bookmarkedEscorts })
      .andWhere('user.role = :role', { role: UserRole.ESCORT })
      .getMany();

    // Remove passwords from response
    return escorts.map(({ password, ...escort }) => escort as User);
  }

  async isBookmarked(userId: string, escortId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.bookmarkedEscorts) {
      return false;
    }
    return user.bookmarkedEscorts.includes(escortId);
  }

  async findSimilarEscorts(
    currentEscortId: string,
    filters: any,
    userLat: number | null,
    userLon: number | null,
    limit: number = 6,
  ): Promise<User[]> {
    // Build base query
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.profilePicture',
        'user.birthDate',
        'user.gender',
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
        'user.showNameInProfile',
      ])
      .addSelect('ST_AsGeoJSON(user.location)::json', 'location')
      .where('user.role = :role', { role: UserRole.ESCORT })
      .andWhere('user.id != :currentId', { currentId: currentEscortId });

    // Add distance calculation if user location is provided
    if (userLat !== null && userLon !== null) {
      query.addSelect(
        `ST_DistanceSphere(
          user.location,
          ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)
        ) / 1000`,
        'distance',
      );
      query.setParameter('userLon', userLon);
      query.setParameter('userLat', userLat);

      // Apply radius filter if provided in filters
      if (filters?.useRadius && filters?.radiusKm) {
        query.andWhere(
          `ST_DistanceSphere(
            user.location,
            ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)
          ) / 1000 <= :radius`,
        );
        query.setParameter('radius', filters.radiusKm);
      }
    }

    const result = await query.getRawAndEntities();

    // Map location data and calculate match scores
    const escorts = result.entities.map((entity, index) => {
      const rawData = result.raw[index];
      if (rawData?.location) {
        entity.location = rawData.location;
      }
      return {
        escort: entity,
        distance: rawData?.distance || Infinity,
        matchScore: this.calculateMatchScore(entity, filters),
      };
    });

    // Sort by match score (descending), then by distance (ascending)
    escorts.sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.distance - b.distance;
    });

    // Return top results without password
    return escorts
      .slice(0, limit)
      .map(({ escort }) => {
        const { password, ...escortWithoutPassword } = escort;
        return escortWithoutPassword as User;
      });
  }

  private calculateMatchScore(escort: User, filters: any): number {
    if (!filters) return 0;

    let score = 0;

    // Age match
    if (filters.ageMin !== null || filters.ageMax !== null) {
      if (escort.birthDate) {
        const age = this.calculateAge(escort.birthDate);
        const ageMatch =
          (filters.ageMin === null || age >= filters.ageMin) &&
          (filters.ageMax === null || age <= filters.ageMax);
        if (ageMatch) score += 10;
      }
    }

    // Nationalities match
    if (filters.nationalities?.length > 0 && escort.nationalities?.length > 0) {
      const hasMatch = filters.nationalities.some((nat: string) =>
        escort.nationalities.includes(nat),
      );
      if (hasMatch) score += 10;
    }

    // Languages match
    if (filters.languages?.length > 0 && escort.languages?.length > 0) {
      const hasMatch = filters.languages.some((lang: string) =>
        escort.languages.includes(lang),
      );
      if (hasMatch) score += 8;
    }

    // Type match
    if (filters.types?.length > 0 && escort.type) {
      if (filters.types.includes(escort.type)) score += 10;
    }

    // Height match
    if (filters.heightMin !== null || filters.heightMax !== null) {
      if (escort.height) {
        const heightMatch =
          (filters.heightMin === null || escort.height >= filters.heightMin) &&
          (filters.heightMax === null || escort.height <= filters.heightMax);
        if (heightMatch) score += 5;
      }
    }

    // Weight match
    if (filters.weightMin !== null || filters.weightMax !== null) {
      if (escort.weight) {
        const weightMatch =
          (filters.weightMin === null || escort.weight >= filters.weightMin) &&
          (filters.weightMax === null || escort.weight <= filters.weightMax);
        if (weightMatch) score += 5;
      }
    }

    // Body types match
    if (filters.bodyTypes?.length > 0 && escort.bodyType) {
      if (filters.bodyTypes.includes(escort.bodyType)) score += 8;
    }

    // Cup sizes match
    if (filters.cupSizes?.length > 0 && escort.cupSize) {
      if (filters.cupSizes.includes(escort.cupSize)) score += 8;
    }

    // Hair colors match
    if (filters.hairColors?.length > 0 && escort.hairColor) {
      if (filters.hairColors.includes(escort.hairColor)) score += 5;
    }

    // Hair lengths match
    if (filters.hairLengths?.length > 0 && escort.hairLength) {
      if (filters.hairLengths.includes(escort.hairLength)) score += 5;
    }

    // Eye colors match
    if (filters.eyeColors?.length > 0 && escort.eyeColor) {
      if (filters.eyeColors.includes(escort.eyeColor)) score += 5;
    }

    // Intimate hair match
    if (filters.intimateHair?.length > 0 && escort.intimateHair) {
      if (filters.intimateHair.includes(escort.intimateHair)) score += 5;
    }

    // Tattoos match
    if (filters.hasTattoos === 'yes' && escort.hasTattoos) score += 3;
    if (filters.hasTattoos === 'no' && !escort.hasTattoos) score += 3;

    // Piercings match
    if (filters.hasPiercings === 'yes' && escort.hasPiercings) score += 3;
    if (filters.hasPiercings === 'no' && !escort.hasPiercings) score += 3;

    return score;
  }

  private calculateAge(birthDate: string | Date): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}