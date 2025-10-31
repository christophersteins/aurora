'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import { CreateReviewDto, UpdateReviewDto } from '@/types/review';

interface ReviewFormProps {
  onSubmit: (data: CreateReviewDto | UpdateReviewDto) => Promise<void>;
  onCancel: () => void;
  initialRating?: number;
  initialComment?: string;
  isEdit?: boolean;
  isLoading?: boolean;
}

export default function ReviewForm({
  onSubmit,
  onCancel,
  initialRating = 0,
  initialComment = '',
  isEdit = false,
  isLoading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Bitte gib eine Bewertung ab');
      return;
    }

    try {
      await onSubmit({ rating, comment: comment.trim() || undefined });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Speichern der Bewertung');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? 'Bewertung bearbeiten' : 'Bewertung schreiben'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bewertung *
          </label>
          <StarRating
            rating={rating}
            onChange={setRating}
            size="lg"
          />
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Kommentar (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Teile deine Erfahrung..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            maxLength={1000}
          />
          <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
            {comment.length}/1000
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isLoading || rating === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Wird gespeichert...' : isEdit ? 'Aktualisieren' : 'Bewertung abgeben'}
          </button>
        </div>
      </form>
    </div>
  );
}
