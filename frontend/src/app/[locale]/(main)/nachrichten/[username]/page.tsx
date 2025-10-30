'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useAuthStore } from '@/store/authStore';

export default function ChatPage() {
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const recipientUsername = params.username as string;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');

  useEffect(() => {
    const findOrCreateConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get JWT token from localStorage
        const storedAuth = localStorage.getItem('aurora-auth-storage');
        let token = '';
        if (storedAuth) {
          try {
            const parsedAuth = JSON.parse(storedAuth);
            token = parsedAuth.state?.token || '';
          } catch (e) {
            console.error('Error parsing auth:', e);
          }
        }

        // First, get the user by username to get their ID
        const userResponse = await fetch(`http://localhost:4000/users/username/${recipientUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        });

        if (!userResponse.ok) {
          throw new Error('Benutzer nicht gefunden');
        }

        const otherUser = await userResponse.json();
        const recipientId = otherUser.id;
        setOtherUserName(otherUser.username);

        // Then create or find the conversation
        const response = await fetch('http://localhost:4000/chat/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ otherUserId: recipientId }),
        });

        if (response.ok) {
          const conversation = await response.json();
          setConversationId(conversation.id);
          setOtherUserName(conversation.otherUserName || otherUser.username);
        } else {
          const errorText = await response.text();
          console.error('Server error:', response.status, errorText);
          setError('Konversation konnte nicht geladen werden');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Netzwerkfehler beim Laden der Konversation');
        console.error('Fehler beim Laden der Konversation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipientUsername) {
      findOrCreateConversation();
    }
  }, [recipientUsername]);

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
      {/* Chat container with max width */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto h-full" style={{ maxWidth: 'var(--max-content-width)' }}>
          <ChatWindow
            conversationId={conversationId}
            currentUserId={user?.id || ''}
            onBack={() => router.back()}
          />
        </div>
      </div>
    </div>
  );
}