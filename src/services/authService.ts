import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
} from 'firebase/auth'
import type { AuthUser, User } from '@/types';


export const loginService = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const logoutService = async () => {
  return signOut(auth)
}

export const setupAuthListener = (onAuthChange: (user: AuthUser | null, error?: string) => void): Unsubscribe => {
  return onAuthStateChanged(auth, async (authUser) => {
    try {
      if (authUser) {
        const user = await getDoc(doc(db, 'users', authUser.uid));
        if(user.exists()) {
          const userData = user.data() as User;
          
          onAuthChange({
            uid: user.id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            is_first_login: userData.is_first_login,
          });
        } else {
          onAuthChange(null);
        }
      } else {
        onAuthChange(null);
      }
    } catch (error: any) {
      onAuthChange(null, error.message);
    }
  });
}