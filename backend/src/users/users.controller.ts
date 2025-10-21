import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { GalleryPhotosService } from './gallery-photos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateEscortProfileDto } from './dto/update-escort-profile.dto';
import { User } from './entities/user.entity';
import { GalleryPhoto } from './entities/gallery-photo.entity';
import { multerConfig, galleryMulterConfig } from '../config/multer.config';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly galleryPhotosService: GalleryPhotosService,
  ) {}

  @Get('nearby')
  @UseGuards(JwtAuthGuard)
  async findNearbyUsers(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius: string,
    @Request() req,
  ) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);

    if (isNaN(lat) || isNaN(lon) || isNaN(rad)) {
      throw new BadRequestException('Invalid coordinates or radius');
    }

    return this.usersService.findUsersWithinRadius(lat, lon, rad, req.user.id);
  }

  @Get('escorts')
  async getEscorts() {
    return this.usersService.findAllEscorts();
  }

  @Get('username/:username')
  async getEscortByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username.toLowerCase());
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    // Entferne das Passwort aus der Response
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  @Patch('location')
  @UseGuards(JwtAuthGuard)
  async updateLocation(
    @Request() req,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<User> {
    const userId = req.user.id;
    return this.usersService.updateLocation(
      userId,
      updateLocationDto.latitude,
      updateLocationDto.longitude,
    );
  }

  @Patch('escort-profile')
  @UseGuards(JwtAuthGuard)
  async updateEscortProfile(
    @Request() req,
    @Body() updateEscortProfileDto: UpdateEscortProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const userId = req.user.id;
    const updatedUser = await this.usersService.updateEscortProfile(
      userId,
      updateEscortProfileDto,
    );

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
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

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.profilePicture = profilePictureUrl;
    await this.usersService.updateUser(userId, {
      profilePicture: profilePictureUrl,
    });

    return {
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl,
    };
  }

  // Gallery Photo Endpoints
  @Post('upload-gallery-photos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('photos', 10, galleryMulterConfig))
  async uploadGalleryPhotos(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const userId = req.user.id;
    const uploadedPhotos: GalleryPhoto[] = [];

    for (const file of files) {
      const photo = await this.galleryPhotosService.uploadPhoto(
        userId,
        file.filename,
      );
      uploadedPhotos.push(photo);
    }

    return {
      message: 'Gallery photos uploaded successfully',
      photos: uploadedPhotos,
    };
  }

  @Get('gallery-photos')
  @UseGuards(JwtAuthGuard)
  async getGalleryPhotos(@Request() req) {
    const userId = req.user.id;
    return this.galleryPhotosService.getUserPhotos(userId);
  }

  @Get('gallery-photos/:userId')
  async getPublicGalleryPhotos(@Param('userId') userId: string) {
    return this.galleryPhotosService.getUserPhotos(userId);
  }

  @Delete('gallery-photos/:photoId')
  @UseGuards(JwtAuthGuard)
  async deleteGalleryPhoto(@Request() req, @Param('photoId') photoId: string) {
    const userId = req.user.id;
    await this.galleryPhotosService.deletePhoto(photoId, userId);
    return { message: 'Photo deleted successfully' };
  }

  @Patch('gallery-photos/reorder')
  @UseGuards(JwtAuthGuard)
  async reorderGalleryPhotos(
    @Request() req,
    @Body() body: { photoOrders: { id: string; order: number }[] },
  ) {
    const userId = req.user.id;
    await this.galleryPhotosService.reorderPhotos(userId, body.photoOrders);
    return { message: 'Photos reordered successfully' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<User>> {
    const user = await this.usersService.findById(id);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
}