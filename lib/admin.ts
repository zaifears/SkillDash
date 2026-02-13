import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function checkAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin:', error);
    return false;
  }
}

export async function checkGodMode(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin' && userData.isGodMode === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking god mode:', error);
    return false;
  }
}
