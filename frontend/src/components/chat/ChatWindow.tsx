import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { useChat } from '@/hooks/useChat';

interface ChatWindowProps {
  recipientId: string;
  currentUserId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  recipientId,
  currentUserId,
}) => {
  const { messages, sendMessage, isConnected } = useChat(recipientId);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll zu neuen Nachrichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && isConnected) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">Chat</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Verbunden' : 'Getrennt'}
          </span>
        </div>
      </div>

      {/* Nachrichten-Liste */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Noch keine Nachrichten. Schreibe die erste!
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Eingabefeld */}
      <form
        onSubmit={handleSendMessage}
        className="border-t px-4 py-3 bg-gray-50"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nachricht schreiben..."
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isConnected}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Senden
          </button>
        </div>
      </form>
    </div>
  );
};