import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getAllUsers(page: number, limit: number, role?: string) {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.createdAt',
      ])
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Filter by role if provided
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      queryBuilder.where('user.role = :role', { role });
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'role',
        'profilePicture',
        'location',
        'birthDate',
        'nationalities',
        'languages',
        'type',
        'height',
        'weight',
        'bodyType',
        'cupSize',
        'hairColor',
        'hairLength',
        'eyeColor',
        'intimateHair',
        'hasTattoos',
        'hasPiercings',
        'isSmoker',
        'description',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    await this.usersRepository.save(user);

    return {
      message: 'User role updated successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(user);

    return {
      message: 'User deleted successfully',
      deletedUserId: id,
    };
  }

  async getDashboardStats() {
    const totalUsers = await this.usersRepository.count();
    
    const customerCount = await this.usersRepository.count({
      where: { role: UserRole.CUSTOMER },
    });
    
    const escortCount = await this.usersRepository.count({
      where: { role: UserRole.ESCORT },
    });
    
    const businessCount = await this.usersRepository.count({
      where: { role: UserRole.BUSINESS },
    });
    
    const adminCount = await this.usersRepository.count({
      where: { role: UserRole.ADMIN },
    });

    return {
      totalUsers,
      usersByRole: {
        customer: customerCount,
        escort: escortCount,
        business: businessCount,
        admin: adminCount,
      },
    };
  }
}