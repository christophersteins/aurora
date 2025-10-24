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
      <div className="flex h-screen items-center justify-center bg-page-primary">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted text-lg">Lade Konversationen...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-page-primary overflow-hidden justify-center">
        <div className="flex w-full mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
          {/* Conversation List - Hidden on mobile when chat is selected */}
          <div className={`${selectedConversationId ? 'hidden md:block' : 'block'} w-full md:w-80 flex-shrink-0`}>
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              onNewConversation={() => setIsModalOpen(true)}
            />
          </div>

          {/* Chat Window - Hidden on mobile when no chat selected */}
          <div className={`${!selectedConversationId ? 'hidden md:flex' : 'flex'} flex-1 min-w-0`}>
            {/* Back button for mobile */}
            {selectedConversationId && (
              <div className="md:hidden absolute top-4 left-4 z-20">
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="p-2 bg-page-secondary rounded-full border border-default shadow-lg hover:bg-page-primary transition-all"
                >
                  <svg className="w-6 h-6 text-heading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            )}
            <ChatWindow conversationId={selectedConversationId} currentUserId={user?.id || ''} />
          </div>
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