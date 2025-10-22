'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const recipientId = params.userId as string;
  const currentUserId = 'temp-user-123';

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findOrCreateConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('http://localhost:4000/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ otherUserId: recipientId }),
        });

        if (response.ok) {
          const conversation = await response.json();
          setConversationId(conversation.id);
        } else {
          setError('Could not load conversation');
        }
      } catch (err) {
        setError('Netzwerkfehler beim Laden der Konversation');
        console.error('Fehler beim Laden der Konversation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipientId) {
      findOrCreateConversation();
    }
  }, [recipientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Lade Chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Zurück
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Back button for mobile */}
      <div className="flex items-center gap-3 px-4 py-3 border-b md:hidden" style={{ background: 'var(--background-primary)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full transition-colors"
          style={{ background: 'var(--background-secondary)' }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-body)' }} />
        </button>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Zurück</h1>
      </div>

      {/* Chat container with max width */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto h-full" style={{ maxWidth: 'var(--max-content-width)' }}>
          <ChatWindow
            conversationId={conversationId}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}