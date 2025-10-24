'use client';

import React, { useState, useEffect } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { NewConversationModal } from '@/components/chat/NewConversationModal';
import { useAuthStore } from '@/store/authStore';

interface Conversation {
  id: string;
  otherUserName: string;
  lastMessage?: string;
  unreadCount: number;
}

export default function ChatPage() {
  const { user } = useAuthStore();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Konversationen aus Backend laden
  const fetchConversations = async () => {
    try {
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

      const response = await fetch('http://localhost:4000/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        console.log('✅ Konversationen geladen:', data.length);
      } else {
        console.error('❌ Fehler beim Laden der Konversationen', response.status);
      }
    } catch (error) {
      console.error('❌ Netzwerkfehler:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleCreateConversation = async (otherUserId: string) => {
    try {
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

      const response = await fetch('http://localhost:4000/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ otherUserId }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        console.log('✅ Neue Konversation erstellt:', newConversation);

        // Liste aktualisieren
        await fetchConversations();

        // Open new conversation directly
        setSelectedConversationId(newConversation.id);
      } else {
        console.error('❌ Fehler beim Erstellen der Konversation', response.status);
        alert('Fehler beim Erstellen der Konversation');
      }
    } catch (error) {
      console.error('❌ Netzwerkfehler:', error);
      alert('Netzwerkfehler');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted">Lade Konversationen...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen">
        <div className="flex w-full mx-auto" style={{ maxWidth: 'var(--max-content-width)' }}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onNewConversation={() => setIsModalOpen(true)}
          />
          <ChatWindow conversationId={selectedConversationId} currentUserId={user?.id || ''} />
        </div>
      </div>

      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateConversation={handleCreateConversation}
      />
    </>
  );
}