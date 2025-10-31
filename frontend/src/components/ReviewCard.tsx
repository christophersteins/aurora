'use client';

import { Review } from '@/types/review';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Edit2, Trash2 } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  showReviewedUser?: boolean;
}

export default function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
  showReviewedUser = false,
}: ReviewCardProps) {
  const isOwnReview = currentUserId === review.reviewerId;
  const displayUser = showReviewedUser ? review.reviewedUser : review.reviewer;

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: de });
    } catch {
      return date;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {displayUser?.profilePicture ? (
            <img
              src={displayUser.profilePicture}
              alt={displayUser.username || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {(displayUser?.username?.[0] || 'U').toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {displayUser?.username || 'Anonymer Benutzer'}
            </p>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(review.createdAt)}
                {review.isEdited && ' (bearbeitet)'}
              </span>
            </div>
          </div>
        </div>

        {isOwnReview && (onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="Bewertung bearbeiten"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Möchtest du diese Bewertung wirklich löschen?')) {
                    onDelete(review.id);
                  }
                }}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                aria-label="Bewertung löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {review.comment && (
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}
