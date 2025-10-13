'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const recipientId = params.userId as string;

  // TODO: In Zukunft durch echte User-ID aus Auth-Context ersetzen
  const currentUserId = 'temp-user-123';

  return (
    <div className="flex flex-col h-screen">
      {/* Mobile Header mit Zurück-Button */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white md:hidden">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Zurück</h1>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          recipientId={recipientId}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}