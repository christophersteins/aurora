'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Download, Search, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  email: string;
  notified: boolean;
  createdAt: string;
}

export default function AdminWaitlistPage() {
  const { token } = useAuthStore();
  
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'notified' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [token]);

  const fetchEntries = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:4000/waitlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        setError('Fehler beim Laden der Warteliste');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      const response = await fetch('http://localhost:4000/waitlist/export/csv', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `waitlist_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
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
      const response = await fetch(`http://localhost:4000/waitlist/${id}/notified`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notified: !currentStatus }),
      });

      if (response.ok) {
        setEntries(entries.map(entry => 
          entry.id === id ? { ...entry, notified: !currentStatus } : entry
        ));
      }
    } catch (error) {
      setError('Could not update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkMarkNotified = async () => {
    if (selectedIds.length === 0) return;
    
    setBulkUpdating(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:4000/waitlist/bulk/notified', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds, notified: true }),
      });

      if (response.ok) {
        setEntries(entries.map(entry => 
          selectedIds.includes(entry.id) ? { ...entry, notified: true } : entry
        ));
        setSelectedIds([]);
      }
    } catch (error) {
      setError('Bulk-Update fehlgeschlagen');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`${selectedIds.length} Einträge wirklich löschen?`)) return;
    
    setBulkUpdating(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:4000/waitlist/bulk/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (response.ok) {
        setEntries(entries.filter(entry => !selectedIds.includes(entry.id)));
        setSelectedIds([]);
      }
    } catch (error) {
      setError('Bulk-Löschung fehlgeschlagen');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eintrag wirklich löschen?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/waitlist/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== id));
      }
    } catch (error) {
      setError('Löschen fehlgeschlagen');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'notified' && entry.notified) ||
      (filterStatus === 'pending' && !entry.notified);
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEntries.map(e => e.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Lade Warteliste...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-0" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-heading mb-2">Warteliste</h1>
          <p className="text-text-secondary">
            {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'} insgesamt
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-bg-secondary border-depth rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Nach E-Mail suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'notified')}
            >
              <option value="all">Alle</option>
              <option value="pending">Ausstehend</option>
              <option value="notified">Benachrichtigt</option>
            </select>

            {/* CSV Export */}
            <button
              onClick={handleDownloadCsv}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-text-button-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Exportiere...' : 'CSV Export'}
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
              <span className="text-sm text-text-secondary">
                {selectedIds.length} ausgewählt
              </span>
              <button
                onClick={handleBulkMarkNotified}
                disabled={bulkUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-text-button rounded-lg hover:bg-secondary-hover disabled:opacity-50 transition-colors text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Als benachrichtigt markieren
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-text-button rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Löschen
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-bg-secondary border-depth rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-bg-primary">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredEntries.length && filteredEntries.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border bg-transparent text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  E-Mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-bg-primary transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(entry.id)}
                      onChange={() => {
                        if (selectedIds.includes(entry.id)) {
                          setSelectedIds(selectedIds.filter(id => id !== entry.id));
                        } else {
                          setSelectedIds([...selectedIds, entry.id]);
                        }
                      }}
                      className="rounded border-border bg-transparent text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-regular">
                    {entry.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleNotified(entry.id, entry.notified)}
                      disabled={updatingId === entry.id}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-opacity ${
                        entry.notified
                          ? 'bg-primary/20 text-primary'
                          : 'bg-yellow-500/20 text-yellow-400'
                      } hover:opacity-80`}
                    >
                      {entry.notified ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Benachrichtigt
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Ausstehend
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {new Date(entry.createdAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEntries.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              Keine Einträge gefunden
            </div>
          )}
        </div>
      </div>
    </div>
  );
}