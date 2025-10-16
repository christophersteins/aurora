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

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, currentUserId }) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">Wähle eine Konversation aus</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b bg-gray-100 flex justify-between items-center">
        <h2 className="font-semibold">Chat #{conversationId}</h2>
        <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? '🟢 Verbunden' : '🔴 Getrennt'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <p className="text-gray-400 text-center">Lade Nachrichten...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center">Noch keine Nachrichten</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === currentUserId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
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

      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Nachricht eingeben..."
            disabled={!isConnected || isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
};