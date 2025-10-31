'use client';

import { useState, useEffect } from 'react';
import { Review, ReviewStats } from '@/types/review';
import { reviewService } from '@/services/reviewService';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import { Star } from 'lucide-react';

interface ReviewListProps {
  userId: string;
  currentUserId?: string;
  onReviewEdit?: (review: Review) => void;
  onReviewDeleted?: () => void;
}

export default function ReviewList({
  userId,
  currentUserId,
  onReviewEdit,
  onReviewDeleted,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getReviewsByUser(userId),
        reviewService.getAverageRating(userId),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
      setError('');
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Fehler beim Laden der Bewertungen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      await fetchReviews();
      if (onReviewDeleted) {
        onReviewDeleted();
      }
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert('Fehler beim Löschen der Bewertung');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && stats.count > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Gesamtbewertung
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {stats.average.toFixed(1)}
                </div>
                <div>
                  <StarRating rating={stats.average} readonly size="md" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Basierend auf {stats.count} {stats.count === 1 ? 'Bewertung' : 'Bewertungen'}
                  </p>
                </div>
              </div>
            </div>
            <Star className="w-16 h-16 text-yellow-400 fill-yellow-400 opacity-20" />
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Star className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Noch keine Bewertungen vorhanden
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bewertungen ({reviews.length})
          </h3>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={onReviewEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
