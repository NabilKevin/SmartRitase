import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase';
import type { Vehicle } from '@/types';

export const createVehicle = async (vehicle: Vehicle) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.VEHICLES), {
      ...vehicle,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("Gagal menyimpan data kendaraan: ", error);
    return { success: false, message: error.message }
  }
}

export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.VEHICLES));
    const vehicles: Vehicle[] = [];
    
    querySnapshot.forEach((doc) => {
      vehicles.push({ id: doc.id, ...doc.data() } as Vehicle);
    });
    
    return vehicles;
  } catch (error) {
    console.error("Gagal mengambil data kendaraan:", error);
    throw error;
  }
}

export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
  try {
    await updateDoc(doc(db, 'vehicles', id), {
      ...vehicle,
      updated_at: serverTimestamp(),
    });
    
    return { success: true, id: id }
  } catch (error: any) {
    console.error("Gagal menyimpan data kendaraan: ", error);
    return { success: false, message: error.message }
  }
}

export const deleteVehicle = async (vehicleId: string | undefined) => {
  if (!vehicleId) {
    console.error("Gagal menghapus: ID kendaraan tidak ditemukan!");
    return;
  }

  try {
    await deleteDoc(doc(db, 'vehicles', vehicleId));
    
    console.log("Data kendaraan berhasil dihapus dari database!");
  } catch (error) {
    console.error("Terjadi kesalahan saat menghapus:", error);
  }
}
