import { create } from 'zustand';

interface OnlineStatusState {
  // Map von userId zu { isOnline, lastSeen }
  userStatuses: Map<string, { isOnline: boolean; lastSeen: Date }>;

  // Aktionen
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string, lastSeen: Date) => void;
  getUserStatus: (userId: string) => { isOnline: boolean; lastSeen: Date | null };
}

export const useOnlineStatusStore = create<OnlineStatusState>((set, get) => ({
  userStatuses: new Map(),

  setUserOnline: (userId: string) => {
    set((state) => {
      const newMap = new Map(state.userStatuses);
      newMap.set(userId, { isOnline: true, lastSeen: new Date() });
      return { userStatuses: newMap };
    });
  },

  setUserOffline: (userId: string, lastSeen: Date) => {
    set((state) => {
      const newMap = new Map(state.userStatuses);
      newMap.set(userId, { isOnline: false, lastSeen });
      return { userStatuses: newMap };
    });
  },

  getUserStatus: (userId: string) => {
    const status = get().userStatuses.get(userId);
    return status || { isOnline: false, lastSeen: null };
  },
}));
