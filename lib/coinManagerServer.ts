// lib/coinManagerServer.ts - PRODUCTION-READY SERVER-SIDE Coin Management

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from './utils/logger';

// Centralized logging using production-aware logger utility
const logError = (context: string, error: any, additionalData?: any) => {
  logger.error(`[CoinManagerServer] ${context}:`, {
    timestamp: new Date().toISOString(),
    message: error.message || error,
    stack: error.stack,
    code: error.code,
    name: error.name,
    ...additionalData
  });
};

const logInfo = (context: string, message: string, data?: any) => {
  logger.info(`[CoinManagerServer] ${context}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logSuccess = (context: string, message: string, data?: any) => {
  logger.success(`[CoinManagerServer] ${context}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logWarning = (context: string, message: string, data?: any) => {
  logger.warn(`[CoinManagerServer] ${context}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// 🔧 SERVICE ACCOUNT CONFIGURATION (from environment variables)
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
  universe_domain: "googleapis.com"
};

// Validate all required fields
if (!serviceAccount.project_id || !serviceAccount.private_key_id || !serviceAccount.private_key || 
    !serviceAccount.client_email || !serviceAccount.client_id || !serviceAccount.client_x509_cert_url) {
  throw new Error('❌ Missing required Firebase Admin SDK configuration. Check environment variables: FIREBASE_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_ADMIN_CLIENT_ID, FIREBASE_ADMIN_CLIENT_CERT_URL');
}

// Firebase Admin initialization
let initializationAttempts = 0;
const maxInitAttempts = 3;

function initializeFirebaseAdmin() {
  initializationAttempts++;
  try {
    logInfo('INIT', `Firebase Admin initialization attempt ${initializationAttempts}/${maxInitAttempts}...`);
    if (!serviceAccount.private_key || !serviceAccount.client_email || !serviceAccount.project_id) {
      throw new Error('Invalid service account configuration - missing required fields');
    }
    logInfo('INIT', 'Service account validation successful, initializing app...');
    initializeApp({
      credential: cert(serviceAccount as any),
      projectId: serviceAccount.project_id
    });
    logSuccess('INIT', `Firebase Admin initialized successfully (attempt ${initializationAttempts})`);
    return true;
  } catch (error: any) {
    logError('INIT', error, { 
      appsLength: getApps().length,
      env: process.env.NODE_ENV,
      attempt: initializationAttempts,
      maxAttempts: maxInitAttempts
    });
    if (initializationAttempts < maxInitAttempts) {
      logWarning('INIT', `Retrying initialization in 1 second... (attempt ${initializationAttempts + 1}/${maxInitAttempts})`);
      setTimeout(() => initializeFirebaseAdmin(), 1000);
      return false;
    }
    throw new Error(`Firebase Admin initialization failed after ${maxInitAttempts} attempts: ${error.message}`);
  }
}

if (!getApps().length) {
  initializeFirebaseAdmin();
}

// Firestore connection
let db: any;
let dbInitialized = false;
function initializeFirestore() {
  try {
    if (!dbInitialized) {
      db = getFirestore();
      dbInitialized = true;
      logSuccess('DB', 'Firestore connection established successfully');
    }
    return db;
  } catch (error: any) {
    logError('DB', error, { 
      appsLength: getApps().length,
      dbInitialized,
      env: process.env.NODE_ENV
    });
    throw new Error(`Firestore connection failed: ${error.message}`);
  }
}
initializeFirestore();

// Interfaces
interface CoinOperationResult {
  success: boolean;
  newBalance: number;
  error?: string;
  transactionId?: string;
  timestamp?: Date;
}

interface TransactionRecord {
  id?: string;
  userId: string;
  amount: number;
  action: 'add' | 'deduct';
  feature?: string;
  reason?: string;
  timestamp: Date;
  success: boolean;
  beforeBalance: number;
  afterBalance: number;
  description: string;
  metadata?: Record<string, any>;
}

// Main class
export class CoinManagerServer {
  // Ensure user doc exists
  static async ensureUserExists(userId: string): Promise<boolean> {
    const context = 'ensureUserExists';
    try {
      if (!userId) {
        logError(context, new Error('userId is required'), { userId });
        return false;
      }
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        logWarning(context, `User document not found for ${userId}, creating with default values...`);
        await db.collection('users').doc(userId).set({
          coins: 0,
          createdAt: new Date(),
          lastCoinUpdate: new Date(),
          autoCreated: true,
          createdBy: 'CoinManagerServer'
        });
        logSuccess(context, `Created user document for ${userId} with 0 coins`);
        return true;
      }
      return true;
    } catch (error: any) {
      logError(context, error, { userId });
      return false;
    }
  }

  // Check if user has enough coins
  static async hasEnoughCoins(userId: string, requiredCoins: number = 1): Promise<boolean> {
    const context = 'hasEnoughCoins';
    try {
      if (!userId) {
        logError(context, new Error('userId is required'), { userId, requiredCoins });
        return false;
      }
      if (typeof requiredCoins !== 'number' || requiredCoins < 0) {
        logError(context, new Error('Invalid requiredCoins'), { userId, requiredCoins });
        return false;
      }
      logInfo(context, `Checking if user ${userId} has ${requiredCoins} coins...`);
      await this.ensureUserExists(userId);
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        logError(context, new Error('User document still not found after creation attempt'), { userId, requiredCoins });
        return false;
      }
      const userData = userDoc.data();
      const currentCoins = userData?.coins || 0;
      const hasEnough = currentCoins >= requiredCoins;
      logInfo(context, `User ${userId} has ${currentCoins} coins (needs ${requiredCoins}) - ${hasEnough ? 'SUFFICIENT' : 'INSUFFICIENT'}`);
      return hasEnough;
    } catch (error: any) {
      logError(context, error, { userId, requiredCoins });
      return false;
    }
  }

  // Get user's coin balance with timeout protection
  static async getCoinBalance(userId: string, timeoutMs: number = 5000): Promise<number> {
    const context = 'getCoinBalance';
    try {
      if (!userId) {
        logError(context, new Error('userId is required'), { userId });
        return 0;
      }
      logInfo(context, `Getting coin balance for user ${userId}...`);

      // Fix #8: Add timeout to prevent indefinite hangs
      const timeoutPromise = new Promise<number>((_, reject) =>
        setTimeout(() => reject(new Error(`Firestore query timeout after ${timeoutMs}ms`)), timeoutMs)
      );

      const queryPromise = (async () => {
        await this.ensureUserExists(userId);
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
          logWarning(context, `User document still not found for ${userId} after creation attempt`);
          return 0;
        }
        const userData = userDoc.data();
        return userData?.coins || 0;
      })();

      const balance = await Promise.race([queryPromise, timeoutPromise]);
      logSuccess(context, `User ${userId} balance: ${balance} coins`);
      return balance;
    } catch (error: any) {
      logError(context, error, { userId, timeoutMs });
      return 0;
    }
  }

  // Deduct coins
  static async deductCoins(
    userId: string, 
    amount: number = 1, 
    feature: 'resume-feedback' | 'discover' | 'premium-feature' | 'ai-analysis',
    description?: string
  ): Promise<CoinOperationResult> {
    const context = 'deductCoins';
    const timestamp = new Date();
    try {
      if (!userId) {
        const error = 'userId is required';
        logError(context, new Error(error), { userId, amount, feature });
        return { success: false, newBalance: 0, error, timestamp };
      }
      if (typeof amount !== 'number' || amount <= 0) {
        const error = 'Invalid amount - must be positive number';
        logError(context, new Error(error), { userId, amount, feature });
        return { success: false, newBalance: 0, error, timestamp };
      }
      if (!feature) {
        const error = 'feature is required';
        logError(context, new Error(error), { userId, amount, feature });
        return { success: false, newBalance: 0, error, timestamp };
      }
      logInfo(context, `Starting coin deduction: ${amount} coins for ${feature} (user: ${userId})`);
      await this.ensureUserExists(userId);
      const result = await db.runTransaction(async (transaction: any) => {
        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists) {
          throw new Error('User document not found in transaction');
        }
        const userData = userDoc.data();
        const currentCoins = userData?.coins || 0;
        logInfo(context, `Current balance: ${currentCoins} coins`);

        // Fix #7: Detect and auto-correct negative coin balance (database corruption)
        if (currentCoins < 0) {
          logWarning(context, `Detected negative coin balance for user ${userId}: ${currentCoins}. Auto-correcting to 0.`, { userId, negativeBalance: currentCoins });
          transaction.update(userDocRef, { coins: 0 });
          throw new Error('Account balance was corrupted and has been reset to 0. Please contact support.');
        }

        if (currentCoins < amount) {
          throw new Error(`Insufficient coins: has ${currentCoins}, needs ${amount}`);
        }
        const newBalance = currentCoins - amount;
        transaction.update(userDocRef, { 
          coins: newBalance,
          lastCoinUpdate: timestamp,
          lastCoinAction: 'deduct',
          [`${feature}LastUsed`]: timestamp,
          [`${feature}UsageCount`]: (userData[`${feature}UsageCount`] || 0) + 1
        });
        logSuccess(context, `Transaction successful: ${currentCoins} → ${newBalance} coins`);
        return { newBalance, beforeBalance: currentCoins };
      });
      let transactionId: string | undefined;
      try {
        const transactionDoc = await db.collection('coinTransactions').add({
          userId,
          amount,
          action: 'deduct',
          feature,
          timestamp,
          success: true,
          beforeBalance: result.beforeBalance,
          afterBalance: result.newBalance,
          description: description || `Used ${amount} coin(s) for ${feature.replace('-', ' ')}`,
          metadata: {
            userAgent: 'server-side',
            environment: process.env.NODE_ENV || 'development',
            transactionType: 'coin_deduction',
            featureCategory: feature
          }
        });
        transactionId = transactionDoc.id;
        logSuccess(context, 'Transaction logged successfully', { transactionId });
      } catch (transactionLogError: any) {
        logError(context, transactionLogError, { userId, amount, feature, phase: 'logging' });
      }
      logSuccess(context, `Successfully deducted ${amount} coin(s) for ${feature}. New balance: ${result.newBalance}`);
      return { 
        success: true, 
        newBalance: result.newBalance, 
        transactionId,
        timestamp
      };
    } catch (error: any) {
      logError(context, error, { userId, amount, feature, description });
      let userFriendlyError = 'Failed to deduct coins';
      if (error.message?.includes('Insufficient coins')) {
        userFriendlyError = 'You don\'t have enough coins for this action';
      } else if (error.message?.includes('User document not found')) {
        userFriendlyError = 'User account not found';
      } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
        userFriendlyError = 'Network error - please try again';
      } else if (error.message?.includes('permission')) {
        userFriendlyError = 'Permission denied - please contact support';
      }
      try {
        await db.collection('coinTransactions').add({
          userId,
          amount,
          action: 'deduct',
          feature,
          timestamp,
          success: false,
          error: error.message,
          description: `FAILED: ${description || `Attempted to use ${amount} coin(s) for ${feature}`}`,
          metadata: {
            userAgent: 'server-side',
            environment: process.env.NODE_ENV || 'development',
            errorType: error.name || 'UnknownError',
            errorCode: error.code
          }
        });
      } catch (logError) {
        // Silent fail
      }
      return { 
        success: false, 
        newBalance: 0, 
        error: userFriendlyError,
        timestamp
      };
    }
  }

  // >>> FIXED: Prevent duplicate welcome bonus <<<
  static async addCoins(
    userId: string, 
    amount: number, 
    reason: 'signup_bonus' | 'daily_bonus' | 'admin_grant' | 'referral' | 'promotion' | 'welcome_bonus' | 'email_verification',
    description?: string
  ): Promise<CoinOperationResult> {
    const context = 'addCoins';
    const timestamp = new Date();
    try {
      if (!userId) {
        const error = 'userId is required';
        logError(context, new Error(error), { userId, amount, reason });
        return { success: false, newBalance: 0, error, timestamp };
      }
      if (typeof amount !== 'number' || amount <= 0) {
        const error = 'Invalid amount - must be positive number';
        logError(context, new Error(error), { userId, amount, reason });
        return { success: false, newBalance: 0, error, timestamp };
      }
      logInfo(context, `Starting coin addition: ${amount} coins for ${reason} (user: ${userId})`);
      
      // >>>>>> PREVENT DUPLICATE <<<<<<
      if (reason === 'welcome_bonus') {
        const previousBonus = await db.collection('coinTransactions')
          .where('userId', '==', userId)
          .where('reason', '==', 'welcome_bonus')
          .where('success', '==', true)
          .limit(1)
          .get();
        if (!previousBonus.empty) {
          logInfo(context, `Welcome bonus already granted for user ${userId}, skipping duplicate.`);
          return {
            success: true,
            newBalance: await this.getCoinBalance(userId),
            error: "Welcome bonus already granted for this user.",
            transactionId: previousBonus.docs[0].id,
            timestamp,
          };
        }
      }
      
      // Continue normal granting
      const result = await db.runTransaction(async (transaction: any) => {
        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userDocRef);
        let currentCoins = 0;
        let beforeBalance = 0;
        if (!userDoc.exists) {
          const newBalance = amount;
          transaction.set(userDocRef, {
            coins: newBalance,
            createdAt: timestamp,
            lastCoinUpdate: timestamp,
            createdBy: 'CoinManagerServer',
            [`${reason}GrantedAt`]: timestamp
          });
          logInfo(context, `Created new user document with ${newBalance} coins`);
          return { newBalance, beforeBalance: 0 };
        }
        const userData = userDoc.data();
        currentCoins = userData?.coins || 0;
        beforeBalance = currentCoins;
        const newBalance = currentCoins + amount;
        transaction.update(userDocRef, { 
          coins: newBalance,
          lastCoinUpdate: timestamp,
          lastCoinAction: 'add',
          [`${reason}LastGranted`]: timestamp,
          [`${reason}GrantCount`]: (userData[`${reason}GrantCount`] || 0) + 1,
          [`${reason}TotalAmount`]: (userData[`${reason}TotalAmount`] || 0) + amount
        });
        logSuccess(context, `Transaction successful: ${currentCoins} → ${newBalance} coins`);
        return { newBalance, beforeBalance };
      });
      
      let transactionId: string | undefined;
      try {
        const transactionDoc = await db.collection('coinTransactions').add({
          userId,
          amount,
          action: 'add',
          reason,
          timestamp,
          success: true,
          beforeBalance: result.beforeBalance,
          afterBalance: result.newBalance,
          description: description || `Received ${amount} coin(s) for ${reason.replace('_', ' ')}`,
          metadata: {
            userAgent: 'server-side',
            environment: process.env.NODE_ENV || 'development',
            transactionType: 'coin_addition',
            reasonCategory: reason,
            isBonus: ['signup_bonus', 'daily_bonus', 'welcome_bonus', 'email_verification'].includes(reason)
          }
        });
        transactionId = transactionDoc.id;
        logSuccess(context, 'Transaction logged successfully', { transactionId });
      } catch (transactionLogError: any) {
        logError(context, transactionLogError, { userId, amount, reason, phase: 'logging' });
      }
      
      logSuccess(context, `Successfully added ${amount} coin(s) for ${reason}. New balance: ${result.newBalance}`);
      return { 
        success: true, 
        newBalance: result.newBalance, 
        transactionId,
        timestamp
      };
    } catch (error: any) {
      logError(context, error, { userId, amount, reason, description });
      try {
        await db.collection('coinTransactions').add({
          userId,
          amount,
          action: 'add',
          reason,
          timestamp,
          success: false,
          error: error.message,
          description: `FAILED: ${description || `Attempted to grant ${amount} coin(s) for ${reason}`}`,
          metadata: {
            userAgent: 'server-side',
            environment: process.env.NODE_ENV || 'development',
            errorType: error.name || 'UnknownError'
          }
        });
      } catch (logError) {}
      return { 
        success: false, 
        newBalance: 0, 
        error: error.message || 'Failed to add coins',
        timestamp
      };
    }
  }

  // Get user's transaction history
  static async getUserTransactions(
    userId: string, 
    limit: number = 10,
    action?: 'add' | 'deduct'
  ): Promise<{ success: boolean; transactions: TransactionRecord[]; error?: string }> {
    const context = 'getUserTransactions';
    try {
      if (!userId) {
        const error = 'userId is required';
        logError(context, new Error(error), { userId, limit, action });
        return { success: false, transactions: [], error };
      }
      logInfo(context, `Getting transaction history for user ${userId} (limit: ${limit}, action: ${action || 'all'})`);
      let query: any = db
        .collection('coinTransactions')
        .where('userId', '==', userId);
      if (action) {
        query = query.where('action', '==', action);
      }
      const transactionsQuery = await query
        .orderBy('timestamp', 'desc')
        .limit(Math.min(limit, 100))
        .get();
      const transactions: TransactionRecord[] = transactionsQuery.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          amount: data.amount,
          action: data.action,
          feature: data.feature,
          reason: data.reason,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          success: data.success,
          beforeBalance: data.beforeBalance || 0,
          afterBalance: data.afterBalance || 0,
          description: data.description || '',
          metadata: data.metadata || {}
        };
      });
      logSuccess(context, `Retrieved ${transactions.length} transactions for user ${userId}`);
      return { success: true, transactions };
    } catch (error: any) {
      logError(context, error, { userId, limit, action });
      return { 
        success: false, 
        transactions: [], 
        error: error.message || 'Failed to get transaction history'
      };
    }
  }

  // Initialize user coins (signup bonus)
  static async initializeUserCoins(
    userId: string, 
    initialCoins: number = 5,
    reason: string = 'signup_bonus'
  ): Promise<{ success: boolean; error?: string; newBalance?: number }> {
    const context = 'initializeUserCoins';
    try {
      if (!userId) {
        const error = 'userId is required';
        logError(context, new Error(error), { userId, initialCoins });
        return { success: false, error };
      }
      logInfo(context, `Initializing coins for user ${userId} with ${initialCoins} coins (reason: ${reason})`);
      const userDocRef = db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData?.coins !== undefined && userData?.initialCoinsGranted === true) {
          logInfo(context, `User ${userId} already has coins (${userData.coins}) and initial coins granted - skipping initialization`);
          return { success: true, newBalance: userData.coins };
        }
      }
      const result = await this.addCoins(userId, initialCoins, reason as any, `Initial coins for new user: ${initialCoins} coins`);
      if (result.success) {
        await userDocRef.set({
          initialCoinsGranted: true,
          initializedAt: new Date(),
          initialCoinAmount: initialCoins
        }, { merge: true });
      }
      logSuccess(context, `Successfully initialized ${userId} with ${initialCoins} coins`, { 
        newBalance: result.newBalance,
        transactionId: result.transactionId
      });
      return { 
        success: result.success, 
        error: result.error,
        newBalance: result.newBalance
      };
    } catch (error: any) {
      logError(context, error, { userId, initialCoins, reason });
      return { 
        success: false, 
        error: error.message || 'Failed to initialize user coins'
      };
    }
  }

  // Coin statistics for analytics
  static async getCoinStatistics(userId: string): Promise<{
    success: boolean;
    stats?: {
      currentBalance: number;
      totalEarned: number;
      totalSpent: number;
      transactionCount: number;
      lastActivity: Date | null;
      topFeatures: Array<{ feature: string; count: number; totalAmount: number }>;
    };
    error?: string;
  }> {
    const context = 'getCoinStatistics';
    try {
      if (!userId) {
        const error = 'userId is required';
        logError(context, new Error(error), { userId });
        return { success: false, error };
      }
      logInfo(context, `Getting coin statistics for user ${userId}`);
      const [balance, transactionHistory] = await Promise.all([
        this.getCoinBalance(userId),
        this.getUserTransactions(userId, 100)
      ]);
      if (!transactionHistory.success) {
        throw new Error(transactionHistory.error || 'Failed to get transaction history');
      }
      const transactions = transactionHistory.transactions;
      let totalEarned = 0;
      let totalSpent = 0;
      let lastActivity: Date | null = null;
      const featureUsage: Record<string, { count: number; totalAmount: number }> = {};
      transactions.forEach(transaction => {
        if (transaction.success) {
          if (transaction.action === 'add') {
            totalEarned += transaction.amount;
          } else if (transaction.action === 'deduct') {
            totalSpent += transaction.amount;
            const feature = transaction.feature || 'unknown';
            if (!featureUsage[feature]) {
              featureUsage[feature] = { count: 0, totalAmount: 0 };
            }
            featureUsage[feature].count++;
            featureUsage[feature].totalAmount += transaction.amount;
          }
          if (!lastActivity || transaction.timestamp > lastActivity) {
            lastActivity = transaction.timestamp;
          }
        }
      });
      const topFeatures = Object.entries(featureUsage)
        .map(([feature, data]) => ({ feature, ...data }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);
      const stats = {
        currentBalance: balance,
        totalEarned,
        totalSpent,
        transactionCount: transactions.length,
        lastActivity,
        topFeatures
      };
      logSuccess(context, `Generated statistics for user ${userId}`, stats);
      return { success: true, stats };
    } catch (error: any) {
      logError(context, error, { userId });
      return { 
        success: false, 
        error: error.message || 'Failed to get coin statistics'
      };
    }
  }
}

// Health check
export async function healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
  try {
    await db.collection('_health').doc('test').set({ timestamp: new Date() }, { merge: true });
    return {
      status: 'healthy',
      details: {
        firebase: 'connected',
        firestore: 'connected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    };
  } catch (error: any) {
    logError('HEALTH_CHECK', error);
    return {
      status: 'unhealthy',
      details: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}
