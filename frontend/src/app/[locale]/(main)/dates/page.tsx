'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, User, MessageCircle, Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { DateBooking } from '@/types/date.types';

type TabType = 'all' | 'requests' | 'upcoming' | 'past';

export default function DatesPage() {
  const router = useRouter();
  const t = useTranslations('dates');
  const { user, token, _hasHydrated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [dates, setDates] = useState<DateBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!_hasHydrated) {
      return;
    }

    // Redirect to login if not authenticated after hydration
    if (!user || !token) {
      router.push('/login');
      return;
    }

    const fetchDates = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call when backend endpoint is ready
        // const response = await axios.get('http://localhost:4000/dates', {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });
        // setDates(response.data);

        // Mock data for demonstration
        setDates([]);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching dates:', err);
        setError(err.response?.data?.message || 'Error loading dates');
        setLoading(false);
      }
    };

    fetchDates();
  }, [_hasHydrated, user, token, router]);

  const filterDatesByTab = (dates: DateBooking[], tab: TabType): DateBooking[] => {
    const now = new Date();

    switch (tab) {
      case 'all':
        return dates;
      case 'requests':
        return dates.filter(d => d.status === 'pending');
      case 'upcoming':
        return dates.filter(d => d.status === 'confirmed' && new Date(d.date) >= now);
      case 'past':
        return dates.filter(d => d.status === 'completed' || (d.status === 'confirmed' && new Date(d.date) < now));
      default:
        return dates;
    }
  };

  const handleAcceptDate = (dateId: string) => {
    // TODO: Implement accept date logic
    console.log('Accept date:', dateId);
  };

  const handleDeclineDate = (dateId: string) => {
    // TODO: Implement decline date logic
    console.log('Decline date:', dateId);
  };

  const handleCancelDate = (dateId: string) => {
    // TODO: Implement cancel date logic
    console.log('Cancel date:', dateId);
  };

  const handleSendMessage = (username: string) => {
    router.push(`/nachrichten?username=${username}`);
  };

  const handleViewProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  // Show loading while hydrating or fetching data
  if (!_hasHydrated || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-base btn-primary cursor-pointer"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const filteredDates = filterDatesByTab(dates, activeTab);

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'requests':
        return {
          title: t('noRequests'),
          description: t('noRequestsDescription'),
        };
      case 'upcoming':
        return {
          title: t('noUpcoming'),
          description: t('noUpcomingDescription'),
        };
      case 'past':
        return {
          title: t('noPast'),
          description: t('noPastDescription'),
        };
      default:
        return {
          title: t('noDates'),
          description: t('noDatesDescription'),
        };
    }
  };

  const emptyState = getEmptyStateContent();

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-0" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-heading">{t('title')}</h1>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-default">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 px-2 font-semibold transition-all cursor-pointer relative ${
                activeTab === 'all'
                  ? 'text-action-primary'
                  : 'text-muted hover:text-heading'
              }`}
            >
              {t('tabs.all')}
              {activeTab === 'all' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-t"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-4 px-2 font-semibold transition-all cursor-pointer relative ${
                activeTab === 'requests'
                  ? 'text-action-primary'
                  : 'text-muted hover:text-heading'
              }`}
            >
              {t('tabs.requests')}
              {activeTab === 'requests' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-t"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-4 px-2 font-semibold transition-all cursor-pointer relative ${
                activeTab === 'upcoming'
                  ? 'text-action-primary'
                  : 'text-muted hover:text-heading'
              }`}
            >
              {t('tabs.upcoming')}
              {activeTab === 'upcoming' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-t"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-4 px-2 font-semibold transition-all cursor-pointer relative ${
                activeTab === 'past'
                  ? 'text-action-primary'
                  : 'text-muted hover:text-heading'
              }`}
            >
              {t('tabs.past')}
              {activeTab === 'past' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-t"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {filteredDates.length === 0 ? (
          <div className="text-center py-12 rounded-lg border-depth" style={{ background: 'var(--background-primary)' }}>
            <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
            <p style={{ color: 'var(--text-heading)' }} className="text-xl font-semibold mb-2">
              {emptyState.title}
            </p>
            <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
              {emptyState.description}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => router.push('/escorts')}
                className="btn-base btn-primary cursor-pointer"
              >
                {t('browseEscorts')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDates.map((date) => (
              <div
                key={date.id}
                className="bg-page-primary border-depth rounded-lg p-6 transition-all hover:border-primary"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left side - Profile info */}
                  <div className="flex items-center gap-4">
                    {/* Profile Picture */}
                    <div
                      onClick={() => handleViewProfile(date.escortUsername)}
                      className="w-16 h-16 rounded-full bg-page-secondary flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      {date.escortProfilePicture ? (
                        <img
                          src={`http://localhost:4000${date.escortProfilePicture}`}
                          alt={date.escortName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-muted" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-heading">
                          {t('dateWith')} {date.escortName}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            date.status === 'confirmed'
                              ? 'bg-success-light text-success'
                              : date.status === 'pending'
                              ? 'bg-warning-light text-warning'
                              : date.status === 'completed'
                              ? 'bg-primary-light text-primary'
                              : 'bg-error-light text-error'
                          }`}
                        >
                          {t(`status.${date.status}`)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{date.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{date.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{date.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-wrap gap-2">
                    {date.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptDate(date.id)}
                          className="btn-base btn-success cursor-pointer flex items-center gap-2 text-sm py-2 px-4"
                        >
                          <Check className="w-4 h-4" />
                          {t('actions.accept')}
                        </button>
                        <button
                          onClick={() => handleDeclineDate(date.id)}
                          className="btn-base btn-error cursor-pointer flex items-center gap-2 text-sm py-2 px-4"
                        >
                          <X className="w-4 h-4" />
                          {t('actions.decline')}
                        </button>
                      </>
                    )}
                    {date.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelDate(date.id)}
                        className="btn-base btn-secondary cursor-pointer flex items-center gap-2 text-sm py-2 px-4"
                      >
                        <X className="w-4 h-4" />
                        {t('actions.cancel')}
                      </button>
                    )}
                    <button
                      onClick={() => handleSendMessage(date.escortUsername)}
                      className="btn-base btn-primary cursor-pointer flex items-center gap-2 text-sm py-2 px-4"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t('actions.sendMessage')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
