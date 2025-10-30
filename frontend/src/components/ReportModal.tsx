'use client';

import { useState } from 'react';
import { X, Flag, AlertCircle, Check } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUsername: string;
}

const REPORT_CATEGORIES = [
  {
    id: 'inappropriate_content',
    label: 'Unangemessene Inhalte',
    description: 'Anstößige oder unangemessene Bilder oder Texte'
  },
  {
    id: 'fake_profile',
    label: 'Fake-Profil',
    description: 'Gefälschte Identität oder gestohlene Bilder'
  },
  {
    id: 'harassment',
    label: 'Belästigung',
    description: 'Belästigendes oder bedrohliches Verhalten'
  },
  {
    id: 'spam',
    label: 'Spam',
    description: 'Unerwünschte Werbung oder Spam-Inhalte'
  },
  {
    id: 'scam',
    label: 'Betrug',
    description: 'Betrügerisches Verhalten oder Geldanforderungen'
  },
  {
    id: 'underage',
    label: 'Minderjährig',
    description: 'Person scheint minderjährig zu sein'
  },
  {
    id: 'other',
    label: 'Sonstiges',
    description: 'Andere Gründe'
  }
];

export default function ReportModal({ isOpen, onClose, reportedUserId, reportedUsername }: ReportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    if (!selectedCategory) {
      setSubmitError('Bitte wähle eine Kategorie aus.');
      return;
    }

    if (!description.trim()) {
      setSubmitError('Bitte beschreibe das Problem genauer.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportedUserId,
          category: selectedCategory,
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Fehler beim Senden des Berichts');
      }

      setSubmitSuccess(true);

      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setSubmitError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory('');
    setDescription('');
    setSubmitSuccess(false);
    setSubmitError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-xl border animate-fade-in"
        style={{
          background: 'var(--background-primary)',
          borderColor: 'var(--border)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <Flag className="w-5 h-5" style={{ color: 'var(--color-error)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                Profil melden
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {reportedUsername}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-page-secondary"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {submitSuccess ? (
            // Success State
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16, 185, 129, 0.1)' }}
              >
                <Check className="w-8 h-8" style={{ color: 'var(--color-success)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>
                Bericht gesendet
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Vielen Dank für deine Meldung. Wir werden den Bericht prüfen und entsprechende Maßnahmen ergreifen.
              </p>
            </div>
          ) : (
            <>
              {/* Info */}
              <div
                className="p-4 rounded-lg border flex items-start gap-3"
                style={{
                  background: 'rgba(59, 130, 246, 0.05)',
                  borderColor: 'rgba(59, 130, 246, 0.2)',
                }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-secondary)' }} />
                <div className="text-sm" style={{ color: 'var(--text-regular)' }}>
                  <p className="font-medium mb-1" style={{ color: 'var(--text-heading)' }}>
                    Wichtiger Hinweis
                  </p>
                  <p>
                    Falsche Meldungen können zu Konsequenzen für dein Konto führen.
                    Bitte melde nur Inhalte, die tatsächlich gegen unsere Richtlinien verstoßen.
                  </p>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-heading)' }}>
                  Grund der Meldung *
                </label>
                <div className="space-y-2">
                  {REPORT_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="w-full p-4 rounded-lg border text-left transition-all cursor-pointer"
                      style={{
                        background: selectedCategory === category.id
                          ? 'rgba(139, 92, 246, 0.08)'
                          : 'var(--background-secondary)',
                        borderColor: selectedCategory === category.id
                          ? 'var(--color-primary)'
                          : 'var(--border)',
                        borderWidth: selectedCategory === category.id ? '2px' : '1px',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                          style={{
                            borderColor: selectedCategory === category.id
                              ? 'var(--color-primary)'
                              : 'var(--border)',
                            background: selectedCategory === category.id
                              ? 'var(--color-primary)'
                              : 'transparent',
                          }}
                        >
                          {selectedCategory === category.id && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: 'white' }}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className="font-medium mb-1"
                            style={{
                              color: selectedCategory === category.id
                                ? 'var(--color-primary)'
                                : 'var(--text-heading)',
                            }}
                          >
                            {category.label}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-heading)' }}>
                  Beschreibung *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bitte beschreibe das Problem so genau wie möglich..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border transition-all resize-none"
                  style={{
                    background: 'var(--background-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-regular)',
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {description.length} / 500 Zeichen
                </p>
              </div>

              {/* Error Message */}
              {submitError && (
                <div
                  className="p-4 rounded-lg border flex items-start gap-3"
                  style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-error)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                    {submitError}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!submitSuccess && (
          <div className="flex items-center gap-3 p-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer btn-base btn-secondary"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedCategory || !description.trim()}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer btn-base btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Wird gesendet...' : 'Bericht senden'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
