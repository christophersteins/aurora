'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useOnlineStatusStore } from '@/store/onlineStatusStore';
import { Circle } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  role?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (otherUserId: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
}) => {
  const { getUserStatus } = useOnlineStatusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setShowResults(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
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

        const response = await fetch(`http://localhost:4000/users/search?query=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const users = await response.json();
          setSearchResults(users);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedUser) return;
    onCreateConversation(selectedUser.id);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    onClose();
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery(user.username);
    setShowResults(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-page-secondary rounded-xl p-6 w-full max-w-md border border-default shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-heading">Neuer Chat</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-heading transition-colors p-1.5 rounded-full hover:bg-page-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 relative" ref={resultsRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedUser(null);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Benutzername suchen..."
            className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-page-primary text-body placeholder:text-muted transition-all"
            autoFocus
          />
          <p className="text-xs text-muted mt-2">
            Suche nach Benutzernamen (min. 2 Zeichen)
          </p>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-page-primary border border-default rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((user) => {
                const liveStatus = getUserStatus(user.id);
                const isOnline = liveStatus.lastSeen ? liveStatus.isOnline : (user.isOnline || false);

                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-page-secondary transition-all text-left first:rounded-t-xl last:rounded-b-xl"
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-page-primary"></div>
                      )}
                    </div>
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-heading truncate">
                          {user.username}
                        </p>
                        {isOnline && (
                          <Circle className="w-2 h-2 fill-success text-success" />
                        )}
                      </div>
                      {(user.firstName || user.lastName) && (
                        <p className="text-sm text-muted truncate">
                          {user.firstName} {user.lastName}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading indicator */}
          {isSearching && (
            <div className="absolute right-4 top-3 text-muted">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="btn-base btn-secondary"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedUser}
            className="btn-base btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Starten</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};