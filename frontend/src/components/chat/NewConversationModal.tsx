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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-page-secondary rounded-lg p-6 w-96 border-depth">
        <h2 className="text-xl font-bold mb-4 text-heading">Neue Konversation starten</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-body mb-2">
            Benutzer-ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="z.B. user-789"
            className="w-full px-4 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
            autoFocus
          />
          <p className="text-xs text-muted mt-1">
            Gib die User-ID des Chat-Partners ein
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-body hover:bg-page-primary rounded-lg transition"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!userId.trim()}
            className="px-4 py-2 bg-action-primary text-button-primary rounded-lg hover:bg-action-primary-hover transition disabled:opacity-50"
          >
            Starten
          </button>
        </div>
      </div>
    </div>
  );
};