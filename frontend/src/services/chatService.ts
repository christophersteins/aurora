import apiClient from '@/lib/api-client';
import { Conversation, Message } from '@/types/chat.types';

export const chatService = {
  // Alle Conversations abrufen (dedupliziert im Backend)
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get('/chat/conversations');
    // Zusätzliche Client-seitige Deduplizierung als Sicherheit
    const conversations = response.data;
    const dedupMap = new Map<string, Conversation>();
    
    for (const conv of conversations) {
      if (!dedupMap.has(conv.otherUserId) || 
          new Date(conv.lastMessageTime || conv.updatedAt) > 
          new Date(dedupMap.get(conv.otherUserId)!.lastMessageTime || dedupMap.get(conv.otherUserId)!.updatedAt)) {
        dedupMap.set(conv.otherUserId, conv);
      }
    }
    
    return Array.from(dedupMap.values()).sort((a, b) => {
      // Sort pinned conversations first, then by last message time
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      const timeA = new Date(a.lastMessageTime || a.updatedAt).getTime();
      const timeB = new Date(b.lastMessageTime || b.updatedAt).getTime();
      return timeB - timeA;
    });
  },

  // Conversation erstellen oder finden (Backend stellt sicher, dass nur eine existiert)
  createOrGetConversation: async (otherUserId: string): Promise<Conversation> => {
    const response = await apiClient.post('/chat/conversations', { otherUserId });
    return response.data;
  },

  // Messages einer Conversation abrufen
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await apiClient.get(
      `/chat/conversations/${conversationId}/messages`
    );
    return response.data;
  },

  // Conversation als gelesen markieren
  markAsRead: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/chat/conversations/${conversationId}/read`);
  },

  // Conversation als ungelesen markieren
  markAsUnread: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/chat/conversations/${conversationId}/unread`);
  },

  // Chat anheften/loslösen
  togglePin: async (conversationId: string): Promise<{ isPinned: boolean }> => {
    const response = await apiClient.post(`/chat/conversations/${conversationId}/pin`);
    return response.data;
  },

  // Chat löschen
  deleteConversation: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/chat/conversations/${conversationId}`);
  },

  // Get total unread message count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/chat/unread-count');
    return response.data.count;
  },
};
