import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: string): Promise<Review> {
    // Check if reviewed user exists
    const reviewedUser = await this.usersRepository.findOne({
      where: { id: createReviewDto.reviewedUserId },
    });

    if (!reviewedUser) {
      throw new NotFoundException('User to review not found');
    }

    // Prevent users from reviewing themselves
    if (reviewerId === createReviewDto.reviewedUserId) {
      throw new BadRequestException('You cannot review yourself');
    }

    // Check if user has already reviewed this user
    const existingReview = await this.reviewsRepository.findOne({
      where: {
        reviewerId,
        reviewedUserId: createReviewDto.reviewedUserId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this user. You can update your existing review instead.');
    }

    const review = this.reviewsRepository.create({
      ...createReviewDto,
      reviewerId,
    });

    return this.reviewsRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewsRepository.find({
      relations: ['reviewer', 'reviewedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByReviewedUser(reviewedUserId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { reviewedUserId },
      relations: ['reviewer', 'reviewedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByReviewer(reviewerId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { reviewerId },
      relations: ['reviewer', 'reviewedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['reviewer', 'reviewedUser'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string): Promise<Review> {
    const review = await this.findOne(id);

    // Only the reviewer can update their own review
    if (review.reviewerId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Mark as edited
    review.isEdited = true;

    // Update fields
    if (updateReviewDto.rating !== undefined) {
      review.rating = updateReviewDto.rating;
    }
    if (updateReviewDto.comment !== undefined) {
      review.comment = updateReviewDto.comment;
    }

    return this.reviewsRepository.save(review);
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.findOne(id);

    // Only the reviewer can delete their own review
    if (review.reviewerId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewsRepository.remove(review);
  }

  async getAverageRating(userId: string): Promise<{ average: number; count: number }> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.reviewedUserId = :userId', { userId })
      .getRawOne();

    return {
      average: parseFloat(result.average) || 0,
      count: parseInt(result.count) || 0,
    };
  }

  async checkUserReview(reviewerId: string, reviewedUserId: string): Promise<Review | null> {
    return this.reviewsRepository.findOne({
      where: {
        reviewerId,
        reviewedUserId,
      },
      relations: ['reviewer', 'reviewedUser'],
    });
  }
}
