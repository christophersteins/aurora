import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete,
  Put,
  Query,
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateLocationDto } from './dto/update-location.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ... bestehende Endpoints

  @Get('nearby')
  @UseGuards(JwtAuthGuard)
  async findNearby(@Query() query: NearbyQueryDto): Promise<User[]> {
    return this.usersService.findUsersWithinRadius(
      query.latitude,
      query.longitude,
      query.radius,
      query.excludeUserId,
    );
  }

  @Put(':id/location')
  @UseGuards(JwtAuthGuard)
  async updateLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<User> {
    return this.usersService.updateLocation(
      id,
      updateLocationDto.latitude,
      updateLocationDto.longitude,
    );
  }
}