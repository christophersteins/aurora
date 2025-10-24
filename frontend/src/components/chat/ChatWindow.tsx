'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  conversationId: string | null;
  currentUserId: string;
}

interface LoadMessagesResponse {
  success: boolean;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }>;
}

interface IncomingMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  otherUserName: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, currentUserId }) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  // Load conversation details to get other user's name
  useEffect(() => {
    if (!conversationId) return;

    const loadConversation = async () => {
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
          const conversations = await response.json();
          const currentConv = conversations.find((c: Conversation) => c.id === conversationId);
          if (currentConv) {
            setConversation(currentConv);
          }
        }
      } catch (error) {
        console.error('Error loading conversation details:', error);
      }
    };

    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    setIsLoading(true);
    console.log('📂 Lade Nachrichten für Konversation:', conversationId);

    socket.emit('loadMessages', { conversationId }, (response: LoadMessagesResponse) => {
      if (response?.success && response.messages) {
        const loadedMessages = response.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(loadedMessages);
        console.log('✅ Nachrichten geladen:', loadedMessages.length);
      }
      setIsLoading(false);
    });
  }, [socket, conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const eventName = `message:${conversationId}`;

    const handleMessage = (message: IncomingMessage) => {
      console.log('📥 Neue Nachricht empfangen:', message);
      
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        
        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp),
        }];
      });
    };

    socket.on(eventName, handleMessage);

    return () => {
      socket.off(eventName, handleMessage);
    };
  }, [socket, conversationId]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !conversationId || !socket) return;

    const messageData = {
      conversationId,
      senderId: currentUserId,
      content: inputValue,
    };

    console.log('📤 Sende Nachricht:', messageData);
    socket.emit('sendMessage', messageData);
    
    setInputValue('');
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full bg-page-primary">
        <p className="text-muted">Wähle eine Konversation aus</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-page-primary">
      <div className="p-4 border-b border-default bg-page-primary flex justify-between items-center">
        <h2 className="font-semibold text-heading">
          {conversation ? conversation.otherUserName : 'Chat wird geladen...'}
        </h2>
        <span className={`text-sm ${isConnected ? 'text-success' : 'text-error'}`}>
          {isConnected ? '🟢 Verbunden' : '🔴 Getrennt'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-page-primary">
        {isLoading ? (
          <p className="text-muted text-center">Lade Nachrichten...</p>
        ) : messages.length === 0 ? (
          <p className="text-muted text-center">Noch keine Nachrichten</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === currentUserId
                    ? 'bg-action-primary text-button-primary'
                    : 'bg-page-secondary text-body'
                }`}
              >
                <p>{msg.content}</p>
                <span className="text-xs opacity-75">
                  {msg.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-default bg-page-primary">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Nachricht eingeben..."
            disabled={!isConnected || isLoading}
            className="flex-1 px-4 py-2 border border-default rounded-lg focus:outline-none disabled:opacity-50 bg-page-secondary text-body"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || isLoading}
            className="px-6 py-2 bg-action-primary text-button-primary rounded-lg hover:bg-action-primary-hover transition disabled:opacity-50"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
};