import { create } from 'zustand';
import type { AuthUser, FetchDriverDataParams, Vehicle } from '@/types';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { createVehicle, getVehicles } from '@/services/vehicleService';

interface VehicleStore {
  vehicles: Vehicle[];
  isLoadingVehicle: boolean;
  fetchVehicles: () => Promise<void>;
  clearVehicles: () => void;
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],
  isLoadingVehicle: false,

  fetchVehicles: async () => {
    if (get().vehicles.length > 0) return;

    set({ isLoadingVehicle: true });

    try {
      const data = await getVehicles();
      
      set({ 
        vehicles: data, 
        isLoadingVehicle: false,
      });
    } catch (error) {
      set({ isLoadingVehicle: false });
    }
  },

  clearVehicles: () => {
    set({ 
      vehicles: [],  
      isLoadingVehicle: false 
    });
  }
}));