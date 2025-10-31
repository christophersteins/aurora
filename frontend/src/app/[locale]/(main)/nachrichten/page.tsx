'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { NewConversationModal } from '@/components/chat/NewConversationModal';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { conversations, setConversations, setLoading } = useChatStore();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Konversationen aus Backend laden
  const fetchConversations = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle opening a conversation via query parameter (e.g., ?username=xxx or ?userId=xxx)
  useEffect(() => {
    const handleQueryParams = async () => {
      const username = searchParams.get('username');
      const userId = searchParams.get('userId');

      if (!username && !userId) return;

      try {
        // Get JWT token
        const storedAuth = localStorage.getItem('aurora-auth-storage');
        let token = '';
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          token = parsedAuth.state?.token || '';
        }

        let targetUserId = userId;

        // If we have a username, resolve it to a user ID
        if (username && !userId) {
          const userResponse = await fetch(`http://localhost:4000/users/username/${username}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include',
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            targetUserId = userData.id;
          }
        }

        if (targetUserId) {
          // Create or find conversation
          const response = await fetch('http://localhost:4000/chat/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ otherUserId: targetUserId }),
          });

          if (response.ok) {
            const conversation = await response.json();
            setSelectedConversationId(conversation.id);
            // Refresh conversations to include the new/found one
            await fetchConversations();
          }
        }
      } catch (error) {
        console.error('Error handling query parameters:', error);
      }

      // Clear query parameters from URL without reload
      router.replace('/nachrichten', { scroll: false });
    };

    if (conversations.length > 0 || searchParams.get('username') || searchParams.get('userId')) {
      handleQueryParams();
    }
  }, [searchParams, conversations.length]);

  // Toggle header visibility on mobile when chat is selected
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      if (selectedConversationId) {
        // Hide header on mobile when chat is open
        header.classList.add('chat-open-mobile-hidden');
      } else {
        // Show header when on conversation list
        header.classList.remove('chat-open-mobile-hidden');
      }
    }

    // Cleanup: always show header when leaving the page
    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.classList.remove('chat-open-mobile-hidden');
      }
    };
  }, [selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    // Simply set the selected conversation ID (no navigation)
    setSelectedConversationId(conversationId);
  };

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

        // Refresh conversations list and select the new conversation
        await fetchConversations();
        setSelectedConversationId(newConversation.id);
        setIsModalOpen(false);
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
      <div className="flex h-[calc(100vh-64px)] lg:h-screen items-center justify-center bg-page-primary">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted text-lg">Lade Konversationen...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex bg-page-primary overflow-hidden w-full h-full">
        {/* Conversation List - Hidden on mobile when chat is selected */}
        <div className={`${selectedConversationId ? 'hidden md:block' : 'block'} w-full md:w-80 flex-shrink-0 h-full`}>
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={() => setIsModalOpen(true)}
            />
        </div>

        {/* Chat Window - Hidden on mobile when no chat selected */}
        <div className={`${!selectedConversationId ? 'hidden md:flex' : 'flex'} flex-1 min-w-0 h-full`}>
          <ChatWindow
            conversationId={selectedConversationId}
            currentUserId={user?.id || ''}
            onBack={() => setSelectedConversationId(null)}
          />
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