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
      className={`flex mb-3 animate-fade-in ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-full md:max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
          isOwnMessage
            ? 'bg-action-primary text-button-primary rounded-br-md'
            : 'bg-page-secondary text-body rounded-bl-md border border-default'
        }`}
      >
        <p className="text-sm break-words leading-relaxed">{message.content}</p>
        <span className="text-xs mt-1.5 block opacity-70">
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
            locale: de,
          })}
        </span>
      </div>
    </div>
  );
};