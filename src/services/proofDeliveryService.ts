import { addDoc, collection, serverTimestamp, getDocs, query, limit, startAfter, where, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase";
import type { deleteDeliveryParam, FetchDeliveriesResponse, FetchDriverDataParams, ProofDelivery } from "@/types";

export const createProofDelivery = async (proofDeliveryData: ProofDelivery) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PROOF_DELIVERIES), {
      ...proofDeliveryData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    await updateDoc(doc(db, 'land_tickets', proofDeliveryData.land_ticket_id), {
      status: 'completed',
      updated_at: new Date()
    })
    
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("Gagal menyimpan data slip bukti pengiriman: ", error);
    return { success: false, message: error.message }
  }
}

export const getProofDeliveries = async ({limitCount, driverId, lastVisibleDoc}: FetchDriverDataParams): Promise<FetchDeliveriesResponse> => {
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
      collection(db, COLLECTIONS.PROOF_DELIVERIES),
      orderBy('created_at', 'desc'),
      ...querys
    );
    
    const querySnapshot = await getDocs(q);
    const proofDeliveries: ProofDelivery[] = [];
    
    querySnapshot.forEach((doc) => {
      proofDeliveries.push({ id: doc.id, ...doc.data() } as ProofDelivery);
    });
    
    return { data: proofDeliveries, newLastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null, hasMore: querySnapshot.docs.length === limitCount};
  } catch (error) {
    console.error("Gagal mengambil data slip bukti pengiriman:", error);
    throw error;
  }
}

export const updateProofDelivery = async (id: string, proofDelivery: Partial<ProofDelivery>) => {
  try {
    await updateDoc(doc(db, 'proof_deliveries', id), {
      ...proofDelivery,
      updated_at: serverTimestamp(),
    });
    
    return { success: true, id: id }
  } catch (error: any) {
    console.error("Gagal menyimpan data slip bukti pengiriman: ", error);
    return { success: false, message: error.message }
  }
}

export const deleteProofDelivery = async ({id, landTicketId}: deleteDeliveryParam) => {
  try {
    if(id) {
      await deleteDoc(doc(db, 'proof_deliveries', id));
    } else {
      const q = query(
        collection(db, COLLECTIONS.PROOF_DELIVERIES), 
        where('land_ticket_id', '==', landTicketId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const targetId = snapshot.docs[0].id;
        
        await deleteDoc(doc(db, COLLECTIONS.PROOF_DELIVERIES, targetId));
      }
    }
    updateDoc(doc(db, 'land_tickets', landTicketId), {
      status: 'in_transit'
    })
    
    console.log("Data slip bukti pengiriman berhasil dihapus dari database!");
  } catch (error) {
    console.error("Terjadi kesalahan saat menghapus:", error);
  }
};