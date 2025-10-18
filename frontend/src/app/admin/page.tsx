'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface DashboardStats {
  totalUsers: number;
  usersByRole: {
    customer: number;
    escort: number;
    business: number;
    admin: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, isLoading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }

    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user, isLoading, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Lade Dashboard...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-heading mb-2">Admin Dashboard</h1>
          <p className="text-text-secondary">Willkommen zurück, {user.username || user.email}</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-bg-secondary border-depth rounded-lg p-6">
              <div className="text-sm font-medium text-text-secondary mb-2">Gesamt Benutzer</div>
              <div className="text-3xl font-bold text-primary">{stats.totalUsers}</div>
            </div>

            <div className="bg-bg-secondary border-depth rounded-lg p-6">
              <div className="text-sm font-medium text-text-secondary mb-2">Kunden</div>
              <div className="text-3xl font-bold text-secondary">{stats.usersByRole.customer}</div>
            </div>

            <div className="bg-bg-secondary border-depth rounded-lg p-6">
              <div className="text-sm font-medium text-text-secondary mb-2">Escorts</div>
              <div className="text-3xl font-bold text-tertiary">{stats.usersByRole.escort}</div>
            </div>

            <div className="bg-bg-secondary border-depth rounded-lg p-6">
              <div className="text-sm font-medium text-text-secondary mb-2">Business</div>
              <div className="text-3xl font-bold text-primary-hover">{stats.usersByRole.business}</div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-bg-secondary border-depth rounded-lg p-6">
          <h2 className="text-xl font-bold text-text-heading mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="btn-base btn-primary"
            >
              Benutzer verwalten
            </button>
            <button
              onClick={() => router.push('/admin/waitlist')}
              className="btn-base btn-secondary"
            >
              Warteliste ansehen
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="btn-base btn-secondary"
            >
              Einstellungen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}