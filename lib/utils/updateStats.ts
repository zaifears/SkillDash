import { doc, setDoc, collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Updates the public user count in Firestore
 * Call this after user registration
 */
export async function updateUserCount(): Promise<void> {
  try {
    console.log('🔄 Updating user count...');
    
    // Count all users
    const usersCollection = collection(db, 'users');
    const snapshot = await getCountFromServer(usersCollection);
    const count = snapshot.data().count;
    
    // Update public stats document
    const statsRef = doc(db, 'public_stats', 'site_stats');
    await setDoc(statsRef, {
      userCount: count,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    console.log(`✅ User count updated: ${count}`);
  } catch (error) {
    console.error('❌ Failed to update user count:', error);
    // Don't throw - this shouldn't break user registration
  }
}
