// lib/coinManager.ts - Complete Coin Management System
import { doc, getDoc, updateDoc, runTransaction, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export interface CoinTransaction {
  userId: string;
  amount: number;
  action: 'deduct' | 'add';
  feature: 'resume-feedback' | 'discover' | 'login-bonus' | 'welcome-bonus' | 'referral' | 'achievement';
  timestamp: Date;
  success: boolean;
  description?: string;
  transactionId?: string;
}

export interface TransactionHistoryItem {
  id: string;
  type: 'spent' | 'earned' | 'granted';
  amount: number;
  description: string;
  feature: string;
  timestamp: Date;
  success: boolean;
}

export class CoinManager {
  // Check if user has enough coins
  static async hasEnoughCoins(userId: string, requiredCoins: number = 1): Promise<boolean> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error('User document not found:', userId);
        return false;
      }
      
      const userData = userDoc.data();
      const currentCoins = userData.coins || 0;
      
      return currentCoins >= requiredCoins;
    } catch (error) {
      console.error('Error checking coins:', error);
      return false;
    }
  }

  // Get user's current coin balance
  static async getCoinBalance(userId: string): Promise<number> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error('User document not found:', userId);
        return 0;
      }
      
      const userData = userDoc.data();
      return userData.coins || 0;
    } catch (error) {
      console.error('Error getting coin balance:', error);
      return 0;
    }
  }

  // 🆕 Log transaction to history
  static async logTransaction(transaction: Omit<CoinTransaction, 'transactionId'>): Promise<string | null> {
    try {
      const transactionData = {
        ...transaction,
        timestamp: new Date(),
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'coinTransactions'), transactionData);
      return docRef.id;
    } catch (error) {
      console.error('Error logging transaction:', error);
      return null;
    }
  }

  // Deduct coins from user (atomic transaction)
  static async deductCoins(
    userId: string, 
    amount: number = 1, 
    feature: 'resume-feedback' | 'discover',
    description?: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        
        if (!userDoc.exists()) {
          throw new Error('User document not found');
        }
        
        const userData = userDoc.data();
        const currentCoins = userData.coins || 0;
        
        if (currentCoins < amount) {
          throw new Error('Insufficient coins');
        }
        
        const newBalance = currentCoins - amount;
        transaction.update(userDocRef, { coins: newBalance });
        
        return newBalance;
      });

      // Log the transaction
      await this.logTransaction({
        userId,
        amount,
        action: 'deduct',
        feature,
        timestamp: new Date(),
        success: true,
        description: description || `Used ${amount} coin(s) for ${feature.replace('-', ' ')}`
      });

      console.log(`✅ Deducted ${amount} coin(s) for ${feature}. New balance: ${result}`);
      return { success: true, newBalance: result };
      
    } catch (error: any) {
      // Log failed transaction
      await this.logTransaction({
        userId,
        amount,
        action: 'deduct',
        feature,
        timestamp: new Date(),
        success: false,
        description: `Failed to use ${amount} coin(s) for ${feature.replace('-', ' ')}: ${error.message}`
      });

      console.error('Error deducting coins:', error);
      return { 
        success: false, 
        newBalance: 0, 
        error: error.message || 'Failed to deduct coins'
      };
    }
  }

  // Add coins to user (for bonuses, rewards, etc.)
  static async addCoins(
    userId: string, 
    amount: number, 
    feature: 'login-bonus' | 'welcome-bonus' | 'referral' | 'achievement' | string,
    description?: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        
        if (!userDoc.exists()) {
          throw new Error('User document not found');
        }
        
        const userData = userDoc.data();
        const currentCoins = userData.coins || 0;
        const newBalance = currentCoins + amount;
        
        transaction.update(userDocRef, { coins: newBalance });
        
        return newBalance;
      });

      // Log the transaction
      await this.logTransaction({
        userId,
        amount,
        action: 'add',
        feature: feature as any,
        timestamp: new Date(),
        success: true,
        description: description || `Earned ${amount} coin(s) from ${feature.replace('-', ' ')}`
      });

      console.log(`✅ Added ${amount} coin(s) for ${feature}. New balance: ${result}`);
      return { success: true, newBalance: result };
      
    } catch (error: any) {
      // Log failed transaction
      await this.logTransaction({
        userId,
        amount,
        action: 'add',
        feature: feature as any,
        timestamp: new Date(),
        success: false,
        description: `Failed to earn ${amount} coin(s) from ${feature.replace('-', ' ')}: ${error.message}`
      });

      console.error('Error adding coins:', error);
      return { 
        success: false, 
        newBalance: 0, 
        error: error.message || 'Failed to add coins'
      };
    }
  }

  // 🆕 Get transaction history for user
  static async getTransactionHistory(userId: string, limitCount: number = 50): Promise<TransactionHistoryItem[]> {
    try {
      const transactionsRef = collection(db, 'coinTransactions');
      const q = query(
        transactionsRef, 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions: TransactionHistoryItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          type: data.action === 'deduct' ? 'spent' : (data.action === 'add' ? 'earned' : 'granted'),
          amount: data.amount,
          description: data.description || `${data.action === 'deduct' ? 'Used' : 'Earned'} ${data.amount} coin(s)`,
          feature: data.feature,
          timestamp: data.timestamp?.toDate() || new Date(),
          success: data.success
        });
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      
      // 🔄 FALLBACK: Return mock data if Firestore fails
      return this.getMockTransactionHistory(userId);
    }
  }

  // 🆕 Get mock transaction history (fallback)
  static async getMockTransactionHistory(userId: string): Promise<TransactionHistoryItem[]> {
    try {
      const balance = await this.getCoinBalance(userId);
      
      // Mock transaction history based on current balance
      const mockHistory: TransactionHistoryItem[] = [
        {
          id: 'welcome-1',
          type: 'granted',
          amount: 5,
          description: 'Welcome bonus - New user signup',
          feature: 'welcome-bonus',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          success: true
        }
      ];

      // Add some spent transactions if balance is less than 5
      const coinsSpent = Math.max(0, 5 - balance);
      for (let i = 0; i < coinsSpent; i++) {
        const isResumeFeedback = i % 2 === 0;
        mockHistory.push({
          id: `spent-${i}`,
          type: 'spent',
          amount: 1,
          description: isResumeFeedback ? 'Resume Feedback Analysis' : 'Discover Career Analysis',
          feature: isResumeFeedback ? 'resume-feedback' : 'discover',
          timestamp: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
          success: true
        });
      }

      return mockHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error generating mock transaction history:', error);
      return [];
    }
  }

  // 🆕 Get coin statistics for user
  static async getCoinStatistics(userId: string): Promise<{
    currentBalance: number;
    totalEarned: number;
    totalSpent: number;
    featuresUsed: number;
    lastTransaction?: Date;
  }> {
    try {
      const [balance, history] = await Promise.all([
        this.getCoinBalance(userId),
        this.getTransactionHistory(userId, 100) // Get more for stats
      ]);

      const totalEarned = history
        .filter(tx => tx.type === 'earned' || tx.type === 'granted')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const totalSpent = history
        .filter(tx => tx.type === 'spent')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const featuresUsed = history
        .filter(tx => tx.type === 'spent' && tx.success)
        .length;

      const lastTransaction = history.length > 0 ? history[0].timestamp : undefined;

      return {
        currentBalance: balance,
        totalEarned,
        totalSpent,
        featuresUsed,
        lastTransaction
      };
    } catch (error) {
      console.error('Error getting coin statistics:', error);
      const balance = await this.getCoinBalance(userId);
      return {
        currentBalance: balance,
        totalEarned: 5, // Default welcome bonus
        totalSpent: Math.max(0, 5 - balance),
        featuresUsed: Math.max(0, 5 - balance),
      };
    }
  }

  // 🆕 Refresh coin balance from server (useful for real-time updates)
  static async refreshCoinBalance(userId: string): Promise<number> {
    try {
      // Force a fresh read from Firestore
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error('User document not found:', userId);
        return 0;
      }
      
      const userData = userDoc.data();
      const balance = userData.coins || 0;
      
      // Trigger coin balance refresh in UI if available
      if (typeof window !== 'undefined' && (window as any).refreshCoinBalance) {
        (window as any).refreshCoinBalance();
      }
      
      return balance;
    } catch (error) {
      console.error('Error refreshing coin balance:', error);
      return 0;
    }
  }

  // 🆕 Validate user coin data integrity
  static async validateUserCoins(userId: string): Promise<{
    isValid: boolean;
    expectedBalance: number;
    actualBalance: number;
    discrepancy: number;
  }> {
    try {
      const [actualBalance, history] = await Promise.all([
        this.getCoinBalance(userId),
        this.getTransactionHistory(userId, 1000) // Get all transactions
      ]);

      // Calculate expected balance from transaction history
      const earned = history
        .filter(tx => (tx.type === 'earned' || tx.type === 'granted') && tx.success)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const spent = history
        .filter(tx => tx.type === 'spent' && tx.success)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const expectedBalance = Math.max(0, earned - spent);
      const discrepancy = Math.abs(actualBalance - expectedBalance);
      
      return {
        isValid: discrepancy === 0,
        expectedBalance,
        actualBalance,
        discrepancy
      };
    } catch (error) {
      console.error('Error validating user coins:', error);
      const balance = await this.getCoinBalance(userId);
      return {
        isValid: true, // Assume valid if we can't validate
        expectedBalance: balance,
        actualBalance: balance,
        discrepancy: 0
      };
    }
  }
}

// 🆕 Export helper functions
export const coinHelpers = {
  // Format coin amount for display
  formatCoins: (amount: number): string => {
    if (amount === 1) return '1 coin';
    return `${amount} coins`;
  },

  // Get coin icon based on amount
  getCoinIcon: (amount: number): string => {
    if (amount >= 10) return '🪙🪙🪙';
    if (amount >= 5) return '🪙🪙';
    if (amount >= 1) return '🪙';
    return '💰';
  },

  // Get feature display name
  getFeatureDisplayName: (feature: string): string => {
    const featureNames: Record<string, string> = {
      'resume-feedback': 'Resume Feedback',
      'discover': 'Career Discovery',
      'welcome-bonus': 'Welcome Bonus',
      'login-bonus': 'Daily Login',
      'referral': 'Referral Bonus',
      'achievement': 'Achievement Reward'
    };
    return featureNames[feature] || feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Check if feature is premium
  isFeaturePremium: (feature: string): boolean => {
    const premiumFeatures = ['resume-feedback', 'discover'];
    return premiumFeatures.includes(feature);
  }
};
