import { create } from 'zustand';
import { getUsers } from '../services/userService';
import type { AuthUser } from '@/types';

interface UserStore {
  users: AuthUser[];
  isLoadingUser: boolean;
  fetchUsers: () => Promise<void>;
  clearUsers: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  isLoadingUser: false,

  fetchUsers: async () => {
    if (get().users.length > 0) return;

    set({ isLoadingUser: true });

    try {
      const data = await getUsers();
      
      set({ users: data, isLoadingUser: false });
    } catch (error) {
      set({ isLoadingUser: false });
    }
  },

  clearUsers: () => {
    set({ 
      users: [],  
      isLoadingUser: false 
    });
  },
}));

