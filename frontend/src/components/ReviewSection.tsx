'use client';

import { useState, useEffect } from 'react';
import { Review, CreateReviewDto, UpdateReviewDto } from '@/types/review';
import { reviewService } from '@/services/reviewService';
import { useAuthStore } from '@/store/authStore';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { MessageSquarePlus } from 'lucide-react';

interface ReviewSectionProps {
  userId: string;
}

export default function ReviewSection({ userId }: ReviewSectionProps) {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (user && !isOwnProfile) {
      checkExistingReview();
    }
  }, [user, userId, isOwnProfile]);

  const checkExistingReview = async () => {
    try {
      const review = await reviewService.checkUserReview(userId);
      setExistingReview(review);
    } catch (err) {
      console.error('Error checking existing review:', err);
    }
  };

  const handleCreateReview = async (data: CreateReviewDto) => {
    setIsLoading(true);
    try {
      await reviewService.createReview({ ...data, reviewedUserId: userId });
      setShowForm(false);
      setRefreshKey((prev) => prev + 1);
      await checkExistingReview();
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReview = async (data: UpdateReviewDto) => {
    if (!editingReview) return;

    setIsLoading(true);
    try {
      await reviewService.updateReview(editingReview.id, data);
      setEditingReview(null);
      setShowForm(false);
      setRefreshKey((prev) => prev + 1);
      await checkExistingReview();
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const handleReviewDeleted = () => {
    setRefreshKey((prev) => prev + 1);
    setExistingReview(null);
  };

  return (
    <div className="space-y-6">
      {/* Write Review Button */}
      {!isOwnProfile && user && !showForm && !existingReview && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquarePlus className="w-5 h-5" />
          Bewertung schreiben
        </button>
      )}

      {/* Existing Review Info */}
      {!isOwnProfile && existingReview && !showForm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Du hast diesen Benutzer bereits bewertet. Du kannst deine Bewertung in der Liste unten bearbeiten oder löschen.
          </p>
        </div>
      )}

      {/* Review Form */}
      {showForm && !isOwnProfile && user && (
        <ReviewForm
          onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
          onCancel={handleCancel}
          initialRating={editingReview?.rating}
          initialComment={editingReview?.comment}
          isEdit={!!editingReview}
          isLoading={isLoading}
        />
      )}

      {/* Login Prompt */}
      {!isOwnProfile && !user && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Bitte melde dich an, um eine Bewertung zu schreiben
          </p>
        </div>
      )}

      {/* Reviews List */}
      <ReviewList
        key={refreshKey}
        userId={userId}
        currentUserId={user?.id}
        onReviewEdit={handleEdit}
        onReviewDeleted={handleReviewDeleted}
      />
    </div>
  );
}
