import { collection, doc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { app, db, firebaseConfig } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase';
import type { AuthUser, User } from '@/types';
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from '@/lib/firebase';
import { updatePassword } from 'firebase/auth';

const secondaryApp = initializeApp(firebaseConfig, "AdminApp");
const secondaryAuth = getAuth(secondaryApp);

export const getUsers = async (): Promise<AuthUser[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const users: AuthUser[] = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as AuthUser);
    });
    
    return users;
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    throw error;
  }
}

export const createUser = async (userData: User) => {
  const defaultPassword = "Logistik123!";

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, userData.email, defaultPassword);
    const newUid = userCredential.user.uid;

    await setDoc(doc(db, 'users', newUid), {
      ...userData,
      is_first_login: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    await signOut(secondaryAuth);
    
    return { success: true, id: newUid }
  } catch (error: any) {
    console.error("Gagal menyimpan data user: ", error);
    return { success: false, message: error.message }
  }
}

export const updateUser = async (id: string, user: Partial<User>) => {
  try {
    await updateDoc(doc(db, 'users', id), {
      ...user,
      updated_at: serverTimestamp(),
    });
    
    return { success: true, id: id }
  } catch (error: any) {
    console.error("Gagal menyimpan data user: ", error);
    return { success: false, message: error.message }
  }
}

export const deleteUser = async (id: string) => {
  if (!id) {
    console.error("Gagal menghapus: ID user tidak ditemukan!");
    return;
  }

  const functions = getFunctions(app);
  const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');

  try {
    await deleteUserAccount({ uid: id });
    
    console.log("User berhasil dihapus sepenuhnya dari Database dan Authentication!");
  } catch (error) {
    console.error("Terjadi kesalahan saat menghapus:", error);
    alert("Gagal menghapus user. Pastikan Anda memiliki izin akses.");
  }
}

export const changePassword = async (newPassword: string) => {
  const user = auth.currentUser;

  if (user) {
    try {
      await updatePassword(user, newPassword);
      alert("Password berhasil diubah!");
      await updateDoc(doc(db, 'users', user.uid), {
        is_first_login: false
      })
      location.href = '/'
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert("Demi keamanan, Anda harus logout dan login kembali sebelum bisa mengubah password.");
        await signOut(auth)
        location.href = '/login'
      } else {
        alert("Gagal mengubah password: " + error.message);
      }
    }
  } else {
    alert("Anda belum login!");
  }
};