import { useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useChatStore } from '@/store/chatStore';
import { Message } from '@/types/chat.types';
import { chatService } from '@/services/chatService';

export const useChat = (userId?: string) => {
  const { socket, isConnected } = useSocket();
  const {
    conversations,
    activeConversationId,
    messages,
    addMessage,
    setMessages,
    setConversations,
    markConversationAsRead,
    setLoading,
    setError,
  } = useChatStore();

  // User beim Socket registrieren
  useEffect(() => {
    if (socket && isConnected && userId) {
      socket.emit('registerUser', { userId });
      console.log('✅ User registered with socket:', userId);
    }
  }, [socket, isConnected, userId]);

  // Socket-Event-Listener einrichten
  useEffect(() => {
    if (!socket) return;

    // Neue Nachricht empfangen
    const handleNewMessage = (data: Message & { conversationId: string }) => {
      console.log('📩 New message received:', data);
      addMessage(data.conversationId, data);
    };

    // Nachricht wurde gesendet (Bestätigung)
    const handleMessageReceived = (data: Message & { conversationId: string }) => {
      console.log('✅ Message sent confirmation:', data);
      addMessage(data.conversationId, data);
    };

    // User tippt gerade
    const handleUserTyping = (data: { conversationId: string; userId: string }) => {
      console.log('⌨️ User typing:', data);
      // Hier könntest du einen "typing indicator" im UI anzeigen
    };

    // Als gelesen markiert
    const handleMarkedAsRead = (data: { success: boolean }) => {
      console.log('✓ Marked as read:', data);
    };

    // Error handling
    const handleError = (data: { message: string }) => {
      console.error('❌ Socket error:', data);
      setError(data.message);
    };

    // Event-Listener registrieren
    socket.on('newMessage', handleNewMessage);
    socket.on('messageReceived', handleMessageReceived);
    socket.on('userTyping', handleUserTyping);
    socket.on('markedAsRead', handleMarkedAsRead);
    socket.on('error', handleError);

    // Cleanup
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageReceived', handleMessageReceived);
      socket.off('userTyping', handleUserTyping);
      socket.off('markedAsRead', handleMarkedAsRead);
      socket.off('error', handleError);
    };
  }, [socket, addMessage, setError]);

  // Conversations laden
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data);
      setError(null);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Fehler beim Laden der Conversations');
    } finally {
      setLoading(false);
    }
  }, [setConversations, setLoading, setError]);

  // Messages einer Conversation laden
  const loadMessages = useCallback(
    async (conversationId: string) => {
      try {
        setLoading(true);
        const data = await chatService.getMessages(conversationId);
        setMessages(conversationId, data);
        setError(null);
      } catch (error) {
        console.error('Error loading messages:', error);
        setError('Fehler beim Laden der Nachrichten');
      } finally {
        setLoading(false);
      }
    },
    [setMessages, setLoading, setError]
  );

  // Nachricht senden über Socket
  const sendMessage = useCallback(
    (conversationId: string, receiverId: string, content: string) => {
      if (!socket || !userId || !content.trim()) return;

      socket.emit('sendMessage', {
        conversationId,
        senderId: userId,
        receiverId,
        content: content.trim(),
      });
    },
    [socket, userId]
  );

  // Typing-Indikator senden
  const sendTyping = useCallback(
    (conversationId: string, receiverId: string) => {
      if (!socket || !userId) return;

      socket.emit('typing', {
        conversationId,
        userId,
        receiverId,
      });
    },
    [socket, userId]
  );

  // Als gelesen markieren
  const markAsRead = useCallback(
    async (conversationId: string) => {
      if (!socket || !userId) return;

      try {
        await chatService.markAsRead(conversationId);
        socket.emit('markAsRead', { conversationId, userId });
        markConversationAsRead(conversationId);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    },
    [socket, userId, markConversationAsRead]
  );

  // Conversation erstellen/finden
  const createOrGetConversation = useCallback(
    async (otherUserId: string) => {
      try {
        setLoading(true);
        const conversation = await chatService.createOrGetConversation(otherUserId);
        setError(null);
        return conversation;
      } catch (error) {
        console.error('Error creating conversation:', error);
        setError('Fehler beim Erstellen der Conversation');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  return {
    // State
    conversations,
    activeConversationId,
    messages,
    isConnected,

    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    sendTyping,
    markAsRead,
    createOrGetConversation,
  };
};