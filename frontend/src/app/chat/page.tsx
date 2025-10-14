'use client';

import React, { useState, useEffect } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';

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

  // Konversationen aus Backend laden
  useEffect(() => {
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

    fetchConversations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Lade Konversationen...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />
      <ChatWindow conversationId={selectedConversationId} currentUserId="test-user-123" />
    </div>
  );
}