import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Increments user count using transaction (prevents duplicates)
 * @param userId - Unique user ID to track if already counted
 */
export async function updateUserCount(userId: string): Promise<void> {
  try {
    console.log(`🔄 Checking if user ${userId} already counted...`);
    
    const statsRef = doc(db, 'public_stats', 'site_stats');
    const userTrackRef = doc(db, 'public_stats', 'counted_users', userId);
    
    await runTransaction(db, async (transaction) => {
      // Check if this user was already counted
      const userTrackDoc = await transaction.get(userTrackRef);
      
      if (userTrackDoc.exists()) {
        console.log('✅ User already counted, skipping...');
        return; // Already counted, skip
      }
      
      // Mark user as counted
      transaction.set(userTrackRef, {
        countedAt: new Date().toISOString()
      });
      
      // Increment count
      const statsDoc = await transaction.get(statsRef);
      const currentCount = statsDoc.data()?.userCount || 0;
      
      transaction.set(statsRef, {
        userCount: currentCount + 1,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      console.log(`✅ User count incremented: ${currentCount} → ${currentCount + 1}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to update user count:', error);
  }
}
