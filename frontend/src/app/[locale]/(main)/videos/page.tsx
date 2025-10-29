'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Play, Clock, Eye } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  category: string;
}

export default function VideosPage() {
  const t = useTranslations('videos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Placeholder videos - später durch echte Daten ersetzen
  const videos: Video[] = [
    {
      id: 1,
      title: 'Beispiel Video 1',
      thumbnail: '/placeholder-video.jpg',
      duration: '10:25',
      views: '1.2K',
      category: 'popular'
    },
    {
      id: 2,
      title: 'Beispiel Video 2',
      thumbnail: '/placeholder-video.jpg',
      duration: '08:15',
      views: '856',
      category: 'new'
    },
    {
      id: 3,
      title: 'Beispiel Video 3',
      thumbnail: '/placeholder-video.jpg',
      duration: '12:40',
      views: '2.1K',
      category: 'popular'
    },
    {
      id: 4,
      title: 'Beispiel Video 4',
      thumbnail: '/placeholder-video.jpg',
      duration: '06:30',
      views: '543',
      category: 'new'
    },
    {
      id: 5,
      title: 'Beispiel Video 5',
      thumbnail: '/placeholder-video.jpg',
      duration: '15:20',
      views: '3.4K',
      category: 'popular'
    },
    {
      id: 6,
      title: 'Beispiel Video 6',
      thumbnail: '/placeholder-video.jpg',
      duration: '09:45',
      views: '721',
      category: 'new'
    }
  ];

  const categories = [
    { id: 'all', label: t('categories.all') },
    { id: 'popular', label: t('categories.popular') },
    { id: 'new', label: t('categories.new') }
  ];

  const filteredVideos = selectedCategory === 'all'
    ? videos
    : videos.filter(video => video.category === selectedCategory);

  return (
    <main className="min-h-screen py-8 bg-page-primary">
      <div className="mx-auto px-4 sm:px-6 lg:px-0" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted">
            {t('subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2.5 rounded-lg font-medium transition ${
                  selectedCategory === category.id
                    ? 'bg-[#8b5cf6] text-white'
                    : 'bg-page-secondary text-muted hover:text-body hover:bg-[#2f3336]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group rounded-lg overflow-hidden border border-[#2f3336] bg-page-primary hover:border-[#8b5cf6] transition-all cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-page-secondary overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#00d4ff]/20 via-[#4d7cfe]/20 to-[#b845ed]/20">
                  <Play size={64} className="text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-white text-xs font-medium flex items-center gap-1">
                  <Clock size={12} />
                  {video.duration}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-heading mb-2 line-clamp-2 group-hover:text-[#8b5cf6] transition">
                  {video.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>{video.views} {t('views')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted">{t('noVideos')}</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 p-8 rounded-lg border border-[#2f3336] bg-page-primary">
          <h2 className="text-2xl font-bold text-heading mb-3">
            {t('infoTitle')}
          </h2>
          <p className="text-muted">
            {t('infoText')}
          </p>
        </div>
      </div>
    </main>
  );
}
