import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
  };
  isOwnMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwnMessage 
}) => {
  return (
    <div
      className={`flex mb-4 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-action-primary text-button-primary'
            : 'bg-page-secondary text-body'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <span className="text-xs mt-1 block opacity-75">
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
            locale: de,
          })}
        </span>
      </div>
    </div>
  );
};