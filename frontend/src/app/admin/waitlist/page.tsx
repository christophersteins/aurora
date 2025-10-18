'use client';

import { useAuthStore } from '@/store/authStore';

export default function AdminWaitlistPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Warteliste Test</h1>
        <p className="text-gray-600">User: {user?.email}</p>
        <p className="text-gray-600">Role: {user?.role}</p>
      </div>
    </div>
  );
}