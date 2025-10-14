import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete,
  Put,
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ... bestehende Endpoints (findAll, findOne, create, remove)

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