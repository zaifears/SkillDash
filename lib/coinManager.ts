// lib/coinManager.ts - CLIENT-SIDE (Read-only with auto-recovery)

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export class CoinManager {
  
  // 🪙 GET COIN BALANCE - With Auto-Recovery (Client-side)
  static async getCoinBalance(userId: string): Promise<number> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.warn('User document not found, attempting to create:', userId);
        
        // 🔧 AUTO-CREATE missing user document (client-side safe version)
        await this.createMissingUserDocument(userId);
        
        // Re-fetch after creation
        const newUserDoc = await getDoc(userDocRef);
        if (newUserDoc.exists()) {
          const userData = newUserDoc.data();
          return userData.coins || 0;
        }
        
        console.error('Failed to create user document for:', userId);
        return 0;
      }
      
      const userData = userDoc.data();
      return userData.coins || 0;
    } catch (error) {
      console.error('Error getting coin balance:', error);
      return 0;
    }
  }

  // 🛡️ AUTO-CREATE Missing User Document (Client-side safe)
  static async createMissingUserDocument(userId: string): Promise<void> {
    try {
      const { auth } = await import('./firebase');
      const currentUser = auth.currentUser;
      
      if (currentUser && currentUser.uid === userId) {
        const userDocRef = doc(db, 'users', userId);
        
        // Determine coins based on provider
        let initialCoins = 5; // Default for social/guest
        
        const isEmailPasswordUser = !currentUser.isAnonymous && 
          !currentUser.providerData.some(p => p.providerId === 'google.com' || p.providerId === 'github.com');
        
        if (isEmailPasswordUser && !currentUser.emailVerified) {
          initialCoins = 0; // Email users get 0 coins until verified
        }
        
        await setDoc(userDocRef, {
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email,
          age: null,
          status: 'Other',
          phone: '',
          coins: initialCoins,
          createdAt: new Date().toISOString(),
          autoCreated: true
        });
        
        console.log(`✅ Auto-created user document for ${userId} with ${initialCoins} coins`);
      }
    } catch (error) {
      console.error('Failed to create missing user document:', error);
    }
  }

  // ✅ CHECK IF USER HAS ENOUGH COINS (Client-side safe)
  static async hasEnoughCoins(userId: string, requiredCoins: number = 1): Promise<boolean> {
    try {
      const currentBalance = await this.getCoinBalance(userId);
      return currentBalance >= requiredCoins;
    } catch (error) {
      console.error('Error checking coins:', error);
      return false;
    }
  }

  // 📊 GET TRANSACTION HISTORY (Client-side safe)
  static async getTransactionHistory(userId: string, limitCount: number = 10): Promise<any[]> {
    // This would call your API route that uses CoinManagerServer
    try {
      const response = await fetch(`/api/coins/transactions?userId=${userId}&limit=${limitCount}`);
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }
}
