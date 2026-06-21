import { create } from 'zustand';
import { createProofDelivery, getProofDeliveries } from '../services/proofDeliveryService'; 
import type { AuthUser, FetchDriverDataParams, ProofDelivery } from '@/types';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

interface ProofDeliveryStore {
  proofDeliveries: ProofDelivery[];
  isLoadingProofDelivery: boolean;
  isLoadingMore: boolean; 
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
  hasMore: boolean;
  fetchProofDeliveries: (user?: AuthUser | null) => Promise<void>;
  fetchMoreProofDeliveries: (role: string, user: AuthUser) => Promise<void>;
  clearProofDelivery: () => void;
  createNewProofDelivery: (proofDelivery: Omit<ProofDelivery, 'id'>, user?: AuthUser | null) => Promise<boolean>;
}

const DELIVERY_LIMIT = 50

export const useProofDeliveryStore = create<ProofDeliveryStore>((set, get) => ({
  proofDeliveries: [],
  isLoadingProofDelivery: false,
  isLoadingMore: false,
  lastDoc: null,
  hasMore: true,

  fetchProofDeliveries: async (user?: AuthUser | null) => {
    if (get().proofDeliveries.length > 0) return;

    set({ isLoadingProofDelivery: true });

    try {
      const params = {} as FetchDriverDataParams;

      if(user?.role == 'user') {
        params['driverId'] = user.uid
        params['limitCount'] = DELIVERY_LIMIT
      }
      
      const { data, hasMore, newLastVisible} = await getProofDeliveries(params);
      
      set({ 
        proofDeliveries: data, 
        isLoadingProofDelivery: false,
        lastDoc: newLastVisible,
        hasMore: hasMore 
      });
    } catch (error) {
      set({ isLoadingProofDelivery: false });
    }
  },

  clearProofDelivery: () => {
    set({ 
      proofDeliveries: [],  
      isLoadingProofDelivery: false 
    });
  },

  fetchMoreProofDeliveries: async (role: string, user: AuthUser) => {
    const { lastDoc, proofDeliveries, hasMore } = get();
    
    if (!lastDoc || !hasMore || role === 'admin') return; 
    
    set({ isLoadingMore: true });
    try {
      const params = {} as FetchDriverDataParams;

      if(user?.role == 'user') {
        params['driverId'] = user.uid
        params['limitCount'] = DELIVERY_LIMIT
        params['lastVisibleDoc'] = lastDoc
      }
      
      const { data, hasMore, newLastVisible } = await getProofDeliveries(params);

      set({ 
        proofDeliveries: [...proofDeliveries, ...data],
        lastDoc: newLastVisible,
        hasMore: hasMore
      });
    } catch (error) {
      console.error("Gagal memuat lebih banyak slip bukti pengiriman:", error);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  createNewProofDelivery: async (proofDelivery: Omit<ProofDelivery, 'id'>, user?: AuthUser | null) => {
    try {
      const docRef = await createProofDelivery(proofDelivery)

      console.log(user);
      if(user?.role == 'user') {
        const newDelivery = {
          ...proofDelivery,
          id: docRef.id!
        };
  
        set((state) => ({
          proofDeliveries: [newDelivery, ...state.proofDeliveries]
        }));

        
      }

      return true; 
      
    } catch (error) {
      console.error("Gagal membuat slip galian:", error);
      return false;
    }
  }
}));