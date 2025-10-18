import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GalleryPhotosService } from './gallery-photos.service';
import { User } from './entities/user.entity';
import { GalleryPhoto } from './entities/gallery-photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, GalleryPhoto])],
  providers: [UsersService, GalleryPhotosService],
  controllers: [UsersController],
  exports: [UsersService, GalleryPhotosService],
})
export class UsersModule {}