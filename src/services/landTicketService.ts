import { addDoc, collection, serverTimestamp, getDocs, query, limit, startAfter, where, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase";
import type { FetchDriverDataParams, FetchTicketsResponse, LandTicket } from "@/types";
import { deleteProofDelivery } from "./proofDeliveryService";

export const createLandTicket = async (landTickets: Omit<LandTicket, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.LAND_TICKETS), {
      ...landTickets,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("Gagal menyimpan data slip bon tanah: ", error);
    return { success: false, message: error.message }
  }
}

export const updateLandTicket = async (id: string, landTickets: Partial<LandTicket>) => {
  try {
    await updateDoc(doc(db, 'land_tickets', id), {
      ...landTickets,
      updated_at: serverTimestamp(),
    });
    
    return { success: true, id: id }
  } catch (error: any) {
    console.error("Gagal menyimpan data slip bon tanah: ", error);
    return { success: false, message: error.message }
  }
}

export const deleteLandTicket = async (landTicketId: string | undefined, isCompleted: boolean) => {
  if (!landTicketId) {
    console.error("Gagal menghapus: ID Tiket tidak ditemukan!");
    return;
  }

  try {
    if(isCompleted) {
      await deleteProofDelivery({landTicketId})
    }

    await deleteDoc(doc(db, 'land_tickets', landTicketId));
    
    console.log("Data slip bon tanah berhasil dihapus dari database!");
  } catch (error) {
    console.error("Terjadi kesalahan saat menghapus:", error);
  }
}

export const getLandTickets = async ({limitCount, driverId, lastVisibleDoc}: FetchDriverDataParams): Promise<FetchTicketsResponse> => {
  try {
    const querys = [];

    if(driverId) {
      querys.push(where('driver_id', '==', driverId))
    }

    if (lastVisibleDoc) {
      querys.push(startAfter(lastVisibleDoc));
    }

    if(limitCount) {
      querys.push(limit(limitCount))
    }

    const q = query(
      collection(db, COLLECTIONS.LAND_TICKETS),
      orderBy('date', 'desc'),
      ...querys
    );
    
    const querySnapshot = await getDocs(q);
    const landTickets: LandTicket[] = [];
    
    querySnapshot.forEach((doc) => {
      landTickets.push({ id: doc.id, ...doc.data() } as LandTicket);
    });
    
    return { data: landTickets, newLastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null, hasMore: querySnapshot.docs.length === limitCount};
  } catch (error) {
    console.error("Gagal mengambil data slip bon tanah:", error);
    throw error;
  }
}