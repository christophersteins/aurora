import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('user/:userId')
  findByReviewedUser(@Param('userId') userId: string) {
    return this.reviewsService.findByReviewedUser(userId);
  }

  @Get('user/:userId/average')
  getAverageRating(@Param('userId') userId: string) {
    return this.reviewsService.getAverageRating(userId);
  }

  @Get('user/:userId/check')
  checkUserReview(@Param('userId') userId: string, @Request() req) {
    return this.reviewsService.checkUserReview(req.user.id, userId);
  }

  @Get('my-reviews')
  findMyReviews(@Request() req) {
    return this.reviewsService.findByReviewer(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(id, updateReviewDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.id);
  }
}
