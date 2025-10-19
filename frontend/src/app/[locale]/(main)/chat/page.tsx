'use client';

import React, { useState, useEffect } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { NewConversationModal } from '@/components/chat/NewConversationModal';

interface Conversation {
  id: string;
  otherUserName: string;
  lastMessage?: string;
  unreadCount: number;
}

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Konversationen aus Backend laden
  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:4000/chat/conversations', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        console.log('✅ Konversationen geladen:', data.length);
      } else {
        console.error('❌ Fehler beim Laden der Konversationen');
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
      const response = await fetch('http://localhost:4000/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        console.error('❌ Fehler beim Erstellen der Konversation');
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
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onNewConversation={() => setIsModalOpen(true)}
        />
        <ChatWindow conversationId={selectedConversationId} currentUserId="test-user-123" />
      </div>

      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateConversation={handleCreateConversation}
      />
    </>
  );
}