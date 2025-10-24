'use client';

import React, { useState } from 'react';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (otherUserId: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
}) => {
  const [userId, setUserId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!userId.trim()) return;
    onCreateConversation(userId.trim());
    setUserId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-page-secondary rounded-2xl p-6 w-full max-w-md border border-default shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-heading">Neue Konversation</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-heading transition-colors p-1 rounded-full hover:bg-page-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-body mb-2">
            Benutzer-ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="z.B. user-789"
            className="w-full px-4 py-3 border border-default rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-page-primary text-body placeholder:text-muted transition-all"
            autoFocus
          />
          <p className="text-xs text-muted mt-2 ml-4">
            Gib die User-ID des Chat-Partners ein
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-body hover:bg-page-primary rounded-full transition-all duration-200 font-medium"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!userId.trim()}
            className="px-6 py-2.5 bg-action-primary text-button-primary rounded-full hover:bg-action-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Starten</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};