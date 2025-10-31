import apiClient from '@/lib/api-client';
import { Review, CreateReviewDto, UpdateReviewDto, ReviewStats } from '@/types/review';

export const reviewService = {
  // Create a new review
  async createReview(data: CreateReviewDto): Promise<Review> {
    const response = await apiClient.post<Review>('/reviews', data);
    return response.data;
  },

  // Get all reviews for a specific user
  async getReviewsByUser(userId: string): Promise<Review[]> {
    const response = await apiClient.get<Review[]>(`/reviews/user/${userId}`);
    return response.data;
  },

  // Get average rating for a user
  async getAverageRating(userId: string): Promise<ReviewStats> {
    const response = await apiClient.get<ReviewStats>(`/reviews/user/${userId}/average`);
    return response.data;
  },

  // Check if current user has reviewed a specific user
  async checkUserReview(userId: string): Promise<Review | null> {
    const response = await apiClient.get<Review | null>(`/reviews/user/${userId}/check`);
    return response.data;
  },

  // Get current user's reviews
  async getMyReviews(): Promise<Review[]> {
    const response = await apiClient.get<Review[]>('/reviews/my-reviews');
    return response.data;
  },

  // Update a review
  async updateReview(reviewId: string, data: UpdateReviewDto): Promise<Review> {
    const response = await apiClient.patch<Review>(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  // Get a single review
  async getReview(reviewId: string): Promise<Review> {
    const response = await apiClient.get<Review>(`/reviews/${reviewId}`);
    return response.data;
  },
};
