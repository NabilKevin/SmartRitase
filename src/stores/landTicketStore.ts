import { create } from 'zustand';
import { createLandTicket, getLandTickets } from '../services/landTicketService'; 
import type { AuthUser, FetchDriverDataParams, LandTicket } from '@/types';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

interface LandTicketStore {
  landTickets: LandTicket[];
  isLoadingLandTicket: boolean;
  isLoadingMore: boolean; 
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
  hasMore: boolean;
  fetchLandTickets: (user?: AuthUser | null) => Promise<void>;
  fetchMoreLandTickets: (role: string, user: AuthUser) => Promise<void>;
  clearTickets: () => void;
  createNewLandTicket: (landTicket: Omit<LandTicket, 'id'>, user?: AuthUser | null) => Promise<boolean>;
}

const TICKET_LIMIT = 50

export const useLandTicketStore = create<LandTicketStore>((set, get) => ({
  landTickets: [],
  isLoadingLandTicket: false,
  isLoadingMore: false,
  lastDoc: null,
  hasMore: true,

  fetchLandTickets: async (user?: AuthUser | null) => {
    if (get().landTickets.length > 0) return;

    set({ isLoadingLandTicket: true });

    try {
      const params = {} as FetchDriverDataParams;

      if(user?.role == 'user') {
        params['driverId'] = user.uid
        params['limitCount'] = TICKET_LIMIT
      }
      
      const { data, hasMore, newLastVisible } = await getLandTickets(params);
      
      set({ 
        landTickets: data, 
        isLoadingLandTicket: false,
        lastDoc: newLastVisible,
        hasMore: hasMore
      });
    } catch (error) {
      set({ isLoadingLandTicket: false });
    }
  },

  fetchMoreLandTickets: async (role: string, user: AuthUser) => {
    const { lastDoc, landTickets, hasMore } = get();
    
    if (!lastDoc || !hasMore || role === 'admin') return; 
    
    set({ isLoadingMore: true });
    try {
      const params = {} as FetchDriverDataParams;

      if(user?.role == 'user') {
        params['driverId'] = user.uid
        params['limitCount'] = TICKET_LIMIT
        params['lastVisibleDoc'] = lastDoc
      }
      
      const { data, hasMore, newLastVisible } = await getLandTickets(params);

      set({ 
        landTickets: [...landTickets, ...data],
        lastDoc: newLastVisible,
        hasMore: hasMore
      });
    } catch (error) {
      console.error("Gagal memuat lebih banyak slip bon tanah:", error);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  clearTickets: () => {
    set({ 
      landTickets: [],  
      isLoadingLandTicket: false 
    });
  },

  createNewLandTicket: async (landTicket: Omit<LandTicket, 'id'>, user?: AuthUser | null) => {
    try {
      const docRef = await createLandTicket(landTicket)

      if(user?.role == 'user') {
        const newTicket = {
          ...landTicket,
          id: docRef.id!
        };
  
        set((state) => ({
          landTickets: [newTicket, ...state.landTickets]
        }));
      }

      return true; 
      
    } catch (error) {
      console.error("Gagal membuat slip galian:", error);
      return false;
    }
  }
}));