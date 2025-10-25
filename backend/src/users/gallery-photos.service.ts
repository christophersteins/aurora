import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryPhoto } from './entities/gallery-photo.entity';
import { User } from './entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GalleryPhotosService {
  constructor(
    @InjectRepository(GalleryPhoto)
    private galleryPhotoRepository: Repository<GalleryPhoto>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async uploadPhoto(
    userId: string,
    filename: string,
    isFsk18?: boolean,
  ): Promise<GalleryPhoto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get current photo count to set order
    const photoCount = await this.galleryPhotoRepository.count({
      where: { user: { id: userId } },
    });

    const photoUrl = `/uploads/gallery/${filename}`;
    const galleryPhoto = this.galleryPhotoRepository.create({
      photoUrl,
      order: photoCount,
      user,
      isFsk18: isFsk18 || false,
    });

    return this.galleryPhotoRepository.save(galleryPhoto);
  }

  async getUserPhotos(userId: string): Promise<GalleryPhoto[]> {
    return this.galleryPhotoRepository.find({
      where: { user: { id: userId } },
      order: { order: 'ASC' },
    });
  }

  async deletePhoto(photoId: string, userId: string): Promise<void> {
    const photo = await this.galleryPhotoRepository.findOne({
      where: { id: photoId, user: { id: userId } },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Delete file from disk
    const filePath = path.join(
      process.cwd(),
      'uploads',
      'gallery',
      path.basename(photo.photoUrl),
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.galleryPhotoRepository.remove(photo);
  }

  async reorderPhotos(
    userId: string,
    photoOrders: { id: string; order: number }[],
  ): Promise<void> {
    for (const item of photoOrders) {
      await this.galleryPhotoRepository.update(
        { id: item.id, user: { id: userId } },
        { order: item.order },
      );
    }
  }

  async updatePhotoFlags(
    photoId: string,
    userId: string,
    isFsk18?: boolean,
  ): Promise<GalleryPhoto> {
    const photo = await this.galleryPhotoRepository.findOne({
      where: { id: photoId, user: { id: userId } },
      relations: ['user'],
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (isFsk18 !== undefined) {
      photo.isFsk18 = isFsk18;
    }

    return this.galleryPhotoRepository.save(photo);
  }
}