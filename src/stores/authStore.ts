import { create } from 'zustand'
import { type Unsubscribe } from 'firebase/auth'
import { type AuthUser } from '@/types'
import { loginService, logoutService, setupAuthListener } from '@/services/authService'
import { getAuthErrorMessage } from '@/lib/firebaseErrors';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AuthUser | null;
  loadingLogin: boolean;
  loadingPage: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Unsubscribe;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loadingPage: true,
      loadingLogin: false,
      error: null,

      initializeAuth: () => {
        const unsubscribe = setupAuthListener((user, errorMsg) => {
          if (errorMsg) {
            set({ error: errorMsg, loadingPage: false, user: null });
          } else {
            set({ user, loadingPage: false, error: null });
          }
        });
        
        return unsubscribe;
      },

      login: async (email, password) => {
        set({ loadingLogin: true, error: null });
        try {
          await loginService(email, password);
          set({ loadingLogin: false });
          
        } catch (error: any) {
          const customMessage = getAuthErrorMessage(error.code);

          set({ error: customMessage, loadingLogin: false });
          throw error;
        }
      },
      
      logout: async () => {
        set({ loadingPage: true, error: null });
        try {
          await logoutService();
        } catch (error: any) {
          set({ error: error.message, loadingPage: false });
        }
      },

      clearError: () => set({ error: null }),

    }),
    {
      name: 'auth-storage',
    }
  )
)