import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete,
  Put,
  Patch,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateLocationDto } from './dto/update-location.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { UpdateEscortProfileDto } from './dto/update-escort-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Spezifische Routes zuerst (vor dynamischen Routes wie :id)
  
  @Get('escorts')
  async findAllEscorts(): Promise<User[]> {
    return this.usersService.findAllEscorts();
  }

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

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Dynamische Route :id kommt NACH allen spezifischen GET-Routes
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<User>> {
    const user = await this.usersService.findById(id);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    // Entferne das Passwort aus der Response
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
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

  @Patch('escort-profile')
  @UseGuards(JwtAuthGuard)
  async updateEscortProfile(
    @Request() req,
    @Body() updateEscortProfileDto: UpdateEscortProfileDto,
  ): Promise<User> {
    const userId = req.user.id;
    return this.usersService.updateEscortProfile(userId, updateEscortProfileDto);
  }

  @Post('upload-profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig))
  async uploadProfilePicture(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.id;
    const profilePictureUrl = `/uploads/profile-pictures/${file.filename}`;

    // Aktualisiere User mit neuer Profilbild-URL
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.profilePicture = profilePictureUrl;
    await this.usersService.updateUser(userId, { profilePicture: profilePictureUrl });

    return {
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl,
    };
  }
}