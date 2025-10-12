'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

interface WaitlistEntry {
  id: string;
  email: string;
  notified: boolean;
  createdAt: string;
}

export default function WaitlistDashboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await authService.getProfile();
        const response = await apiClient.get('/waitlist');
        setEntries(response.data);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      const response = await apiClient.get('/waitlist/export/csv', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `waitlist_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('CSV-Export fehlgeschlagen');
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleNotified = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    setError('');
    
    try {
      await apiClient.patch(`/waitlist/${id}/notified`, {
        notified: !currentStatus,
      });

      setEntries(entries.map(entry => 
        entry.id === id ? { ...entry, notified: !currentStatus } : entry
      ));
    } catch (error) {
      setError('Status konnte nicht aktualisiert werden');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map(e => e.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkMarkNotified = async () => {
    if (selectedIds.length === 0) return;
    
    setBulkUpdating(true);
    setError('');
    
    try {
      await apiClient.patch('/waitlist/bulk/notified', {
        ids: selectedIds,
        notified: true,
      });

      setEntries(entries.map(entry => 
        selectedIds.includes(entry.id) ? { ...entry, notified: true } : entry
      ));
      setSelectedIds([]);
    } catch (error) {
      setError('Bulk-Update fehlgeschlagen');
    } finally {
      setBulkUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-indigo-600">Aurora</h1>
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/waitlist"
                  className="text-indigo-600 font-medium border-b-2 border-indigo-600"
                >
                  Warteliste
                </Link>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Warteliste Verwaltung
              </h2>
              <p className="text-gray-600 mt-1">
                {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'} insgesamt
                {selectedIds.length > 0 && (
                  <span className="ml-2 text-indigo-600 font-medium">
                    ({selectedIds.length} ausgewählt)
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkMarkNotified}
                  disabled={bulkUpdating}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {bulkUpdating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Aktualisiere...
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      Ausgewählte als benachrichtigt markieren
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleDownloadCsv}
                disabled={downloading || entries.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {downloading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Exportiere...
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    CSV exportieren
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="m-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b border-gray-200">
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="text-indigo-600 text-sm font-medium">Gesamt</div>
              <div className="text-3xl font-bold text-indigo-900 mt-2">
                {entries.length}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-600 text-sm font-medium">Benachrichtigt</div>
              <div className="text-3xl font-bold text-green-900 mt-2">
                {entries.filter((e) => e.notified).length}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-yellow-600 text-sm font-medium">Ausstehend</div>
              <div className="text-3xl font-bold text-yellow-900 mt-2">
                {entries.filter((e) => !e.notified).length}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === entries.length && entries.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(entry.id)}
                        onChange={() => handleSelectOne(entry.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.notified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Benachrichtigt
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Ausstehend
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleToggleNotified(entry.id, entry.notified)}
                        disabled={updatingId === entry.id}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingId === entry.id ? (
                          'Lädt...'
                        ) : entry.notified ? (
                          '↩️ Rückgängig'
                        ) : (
                          '✅ Als benachrichtigt markieren'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Noch keine Einträge in der Warteliste
            </div>
          )}
        </div>
      </main>
    </div>
  );
}