'use client';

import React, { useState } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Mock-Daten für Test
  const mockConversations = [
    { id: '1', otherUserName: 'Anna Schmidt', lastMessage: 'Hallo, wie geht es dir?', unreadCount: 2 },
    { id: '2', otherUserName: 'Max Müller', lastMessage: 'Bis später!', unreadCount: 0 },
  ];

  return (
    <div className="flex h-screen">
      <ConversationList
        conversations={mockConversations}
        selectedId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />
      <ChatWindow conversationId={selectedConversationId} currentUserId="test-user-123" />
    </div>
  );
}