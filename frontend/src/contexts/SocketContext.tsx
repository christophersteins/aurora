'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePathname } from 'next/navigation';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

// Function to play notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure sound
    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine';

    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pathname = usePathname();
  const currentConversationIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem('aurora-auth-storage');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        currentUserIdRef.current = parsedAuth.state?.user?.id || null;
      } catch (e) {
        console.error('Error parsing auth:', e);
      }
    }
  }, []);

  // Track current conversation from pathname
  useEffect(() => {
    if (pathname?.includes('/chat/')) {
      const parts = pathname.split('/');
      const conversationId = parts[parts.length - 1];
      currentConversationIdRef.current = conversationId;
    } else {
      currentConversationIdRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    // Get JWT token from localStorage
    let token: string | null = null;
    const storedAuth = localStorage.getItem('aurora-auth-storage');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        token = parsedAuth.state?.token || null;
      } catch (e) {
        console.error('Error parsing auth:', e);
      }
    }

    const socketInstance = io('http://localhost:4000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token: token,
      },
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // Listen for all message events globally
    const handleGlobalMessage = (data: any) => {
      console.log('📨 Global message received:', data);

      // Don't play sound if:
      // 1. Message is from current user
      // 2. User is currently viewing this conversation
      const isOwnMessage = data.senderId === currentUserIdRef.current;
      const isCurrentConversation = data.conversationId === currentConversationIdRef.current;

      if (!isOwnMessage && !isCurrentConversation) {
        playNotificationSound();
      }
    };

    // Listen to all conversation message events with a wildcard pattern
    socketInstance.onAny((eventName, ...args) => {
      if (eventName.startsWith('message:')) {
        handleGlobalMessage(args[0]);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.offAny();
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};