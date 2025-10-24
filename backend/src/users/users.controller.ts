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
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

  @Get('escorts/similar')
  async getSimilarEscorts(
    @Query('currentEscortId') currentEscortId: string,
    @Query('filters') filtersJson: string,
    @Query('userLat') userLat: string,
    @Query('userLon') userLon: string,
    @Query('limit') limit: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 6;
    const filters = filtersJson ? JSON.parse(filtersJson) : null;
    const lat = userLat ? parseFloat(userLat) : null;
    const lon = userLon ? parseFloat(userLon) : null;

    return this.usersService.findSimilarEscorts(
      currentEscortId,
      filters,
      lat,
      lon,
      parsedLimit,
    );
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

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, updateProfileDto);
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

  @Patch('profile-picture/from-gallery')
  @UseGuards(JwtAuthGuard)
  async setProfilePictureFromGallery(
    @Request() req,
    @Body() body: { photoUrl: string },
  ) {
    const userId = req.user.id;
    const { photoUrl } = body;

    if (!photoUrl) {
      throw new BadRequestException('Photo URL is required');
    }

    // Verify that the photo belongs to the user
    const photo = await this.galleryPhotosService.getUserPhotos(userId);
    const photoExists = photo.some(p => p.photoUrl === photoUrl);

    if (!photoExists) {
      throw new BadRequestException('Photo not found in gallery');
    }

    // Update user's profile picture
    await this.usersService.updateUser(userId, {
      profilePicture: photoUrl,
    });

    return {
      message: 'Profile picture updated successfully',
      profilePicture: photoUrl,
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

  @Get('username-check/availability')
  @UseGuards(JwtAuthGuard)
  async checkUsernameAvailability(@Request() req) {
    const userId = req.user.id;
    return this.usersService.canChangeUsername(userId);
  }

  @Patch('account/username')
  @UseGuards(JwtAuthGuard)
  async updateUsername(
    @Request() req,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ): Promise<Omit<User, 'password'>> {
    const userId = req.user.id;
    const updatedUser = await this.usersService.updateUsername(
      userId,
      updateUsernameDto.username,
    );

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  @Patch('account/email')
  @UseGuards(JwtAuthGuard)
  async updateEmail(
    @Request() req,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<Omit<User, 'password'>> {
    const userId = req.user.id;
    const updatedUser = await this.usersService.updateEmail(
      userId,
      updateEmailDto.email,
    );

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  @Patch('account/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const userId = req.user.id;
    await this.usersService.updatePassword(
      userId,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword,
    );

    return { message: 'Password updated successfully' };
  }

  // Bookmark / Merkliste Endpoints
  @Post('bookmarks/:escortId')
  @UseGuards(JwtAuthGuard)
  async addBookmark(@Request() req, @Param('escortId') escortId: string) {
    const userId = req.user.id;
    await this.usersService.addBookmark(userId, escortId);
    return { message: 'Escort added to bookmarks' };
  }

  @Delete('bookmarks/:escortId')
  @UseGuards(JwtAuthGuard)
  async removeBookmark(@Request() req, @Param('escortId') escortId: string) {
    const userId = req.user.id;
    await this.usersService.removeBookmark(userId, escortId);
    return { message: 'Escort removed from bookmarks' };
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  async getBookmarks(@Request() req) {
    const userId = req.user.id;
    return this.usersService.getBookmarkedEscorts(userId);
  }

  @Get('bookmarks/check/:escortId')
  @UseGuards(JwtAuthGuard)
  async checkBookmark(@Request() req, @Param('escortId') escortId: string) {
    const userId = req.user.id;
    const isBookmarked = await this.usersService.isBookmarked(userId, escortId);
    return { isBookmarked };
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