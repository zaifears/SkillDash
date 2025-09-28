// lib/coinManagerServer.ts - PRODUCTION-READY SERVER-SIDE Coin Management
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// 🔍 ENHANCED LOGGING UTILITY
const logError = (context: string, error: any, additionalData?: any) => {
  console.error(`❌ [CoinManagerServer] ${context}:`, {
    timestamp: new Date().toISOString(),
    message: error.message || error,
    stack: error.stack,
    code: error.code,
    name: error.name,
    ...additionalData
  });
};

const logInfo = (context: string, message: string, data?: any) => {
  console.log(`🔍 [CoinManagerServer] ${context}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logSuccess = (context: string, message: string, data?: any) => {
  console.log(`✅ [CoinManagerServer] ${context}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logWarning = (context: string, message: string, data?: any) => {
  console.warn(`⚠️ [CoinManagerServer] ${context}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// 🔧 SERVICE ACCOUNT WITH YOUR EXACT PRIVATE KEY (KEPT AS REQUESTED)
const serviceAccount = {
  type: "service_account",
  project_id: "skilldash-c588d",
  private_key_id: "f53d4d2f07d99a8e9b2333d1b05b2049efcc4c46",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3RsPLjpBXH6Mr\nINvpbVCQNsat067uYATJQRvaAakiUb5usA1VbtnuLiBLc7bHDWCPiKFQaa3eTCBY\nlaqWnq6Hbf3T7fFlhMF+kOjiaYrR3AJDIG8OrlrsgJiO8jTsmjQrgmYJaxf96bLp\nW5ri5J8SMSm0C2iNre5E6FDySFWIR8c1+AvWQOMsz7RPDL69qBveIrGcliNQH+Mc\nCmzNLt2pupzWCViScDuQ4/TwU+41hpEmWrk5clnZJAX1iOXUbO+LNVcCXkx15445\ntisiTAh0vJ5hv5JWmdr1eWidAXaDBhCZ+YBZxZkBSx1t8WXsjHjDTnwK6PnwR+VD\nVNX1nQHRAgMBAAECggEAJ/IYgqlT9GlE2wWSaNIWmRgXPZPBsNrksCistVtfTceb\nRezBOzmp7ivHhip2T/Quc5pH7oraBnV5J1WXlLSJPaNPi310+7dvpPJYj+CJDSxy\nocbT7dM6pglxNta7ikYh0MnfC3Z4CDODdzEsFP/XW9OzTzadVyPtpr8rxWLWoZkE\n+j0opPp+U26l0Rw9Emg1NGGGasDz/rw/+LNJ8DCw8piO5oH0iOJuJmSGWAHSzkTE\nXRh+F3N2jIQ+yqP364s894CO9TWxek/tIol3BJKGQBwoUN+cKYOKwtokVdDsWYyc\nFKe1hXYADOr9QFDvbsDo9xxl5q4m4cZDv/FJsipfsQKBgQDZDVq0gUmBTuBOPRdQ\nXv/6/zITfcQ3c0UIfoymjvPKrCtrYCWb8gweF5XmjxlBzipXLr6iEOt0bd/08UDE\nPRDR9Jd9QuYakhAk8er9xVKGGv+G268OboFNuzuP0pTqSvH2bDF0ywtp+hAZtXJB\nsXe9CEFfn7hieDoufUGlGuEcNwKBgQDYKd3hglxVEmTNYLUotnPNfIjDLau71kFR\n9a55sGIyHbh1gn3QEy7eKHbDGOR0Dgs+KdkcrelcR3F1L4g/IrzQeVcfHF3D62pP\npLoovRTX+KEN08a6qBVSHPn46HBhThHZx6EB7idERHhE+EKkDqC/Byj60DK23rDr\n7Vd7D9qeNwKBgQCjtDvGSoC7A1eQCumLl6svjswhAUk9nTXi2zeP49+h68rvuFuF\nS8Cx7Y4Ej8c355vtl3b2WxaLANfaMR9tIrWN9RFQy2UrgyCkDMX00p+UP8ab2xMk\nKlph2yZoKiZgs1fdSOrgMMgSDSWZjk13mLc7nn9X9OoncpBHQfeB5E0GbwKBgEPo\nAxgQx8jB2oDaXI7Jol9vO9d0xXpguGxy7bi0vGRaCdSAhd2T6SlJNOXdMAd1UfrZ\nUqc7yw9+MhpKMFcFJqOnOsM/OgWOMvuKGCEsJRwjsxSQ7uE8ZFZDXBPhkUxAJkNv\n/xiIJDXB/LZN90Fqhvz71tfUB9qC4rl6+fxi4p7JAoGAfkRfH9eScHuWGddbbctK\nUz6ixLy/lTmhGRhKt9YA+G/zLVfnSnUh70olVBEsdZnQXrUNRlpYqjkB/F+2Dlju\n+Vx929VwcbCtI1qHLe/1L0P+fI8cA1Z6nsrDasFMGwBsSvyLARwgNTGWcSw4IkSt\n4hzmfWNLJ4fIuXyodSms63w=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@skilldash-c588d.iam.gserviceaccount.com",
  client_id: "104757635139824728945",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40skilldash-c588d.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// 🔧 ENHANCED INITIALIZATION WITH RETRY LOGIC
let initializationAttempts = 0;
const maxInitAttempts = 3;

function initializeFirebaseAdmin() {
  initializationAttempts++;
  
  try {
    logInfo('INIT', `Firebase Admin initialization attempt ${initializationAttempts}/${maxInitAttempts}...`);
    
    // Validate service account before initialization
    if (!serviceAccount.private_key || !serviceAccount.client_email || !serviceAccount.project_id) {
      throw new Error('Invalid service account configuration - missing required fields');
    }
    
    logInfo('INIT', 'Service account validation successful, initializing app...');

    initializeApp({
      credential: cert(serviceAccount as any),
      projectId: serviceAccount.project_id // Explicit project ID
    });

    logSuccess('INIT', 'Firebase Admin initialized successfully', {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      attempt: initializationAttempts
    });
    
    return true;
  } catch (error) {
    logError('INIT', error, { 
      serviceAccountKeys: Object.keys(serviceAccount || {}),
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

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeFirebaseAdmin();
}

// 🔧 ENHANCED FIRESTORE CONNECTION WITH RETRY
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
  } catch (error) {
    logError('DB', error, { 
      appsLength: getApps().length,
      dbInitialized,
      env: process.env.NODE_ENV
    });
    throw new Error(`Firestore connection failed: ${error.message}`);
  }
}

// Initialize Firestore
initializeFirestore();

// 🎯 ENHANCED INTERFACES
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

export class CoinManagerServer {
  // 🛡️ ENHANCED USER DOCUMENT AUTO-CREATION
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
        
        // Create user document with default values
        await db.collection('users').doc(userId).set({
          coins: 0, // Conservative default
          createdAt: new Date(),
          lastCoinUpdate: new Date(),
          autoCreated: true,
          createdBy: 'CoinManagerServer'
        });
        
        logSuccess(context, `Created user document for ${userId} with 0 coins`);
        return true;
      }
      
      return true;
    } catch (error) {
      logError(context, error, { userId });
      return false;
    }
  }

  // ✅ ENHANCED - Check if user has enough coins with auto-creation
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
      
      // Ensure user exists
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
    } catch (error) {
      logError(context, error, { userId, requiredCoins });
      return false;
    }
  }

  // ✅ ENHANCED - Get user's current coin balance with auto-creation
  static async getCoinBalance(userId: string): Promise<number> {
    const context = 'getCoinBalance';
    
    try {
      if (!userId) {
        logError(context, new Error('userId is required'), { userId });
        return 0;
      }

      logInfo(context, `Getting coin balance for user ${userId}...`);
      
      // Ensure user exists
      await this.ensureUserExists(userId);
      
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        logWarning(context, `User document still not found for ${userId} after creation attempt - returning 0 balance`);
        return 0;
      }
      
      const userData = userDoc.data();
      const balance = userData?.coins || 0;
      
      logSuccess(context, `User ${userId} balance: ${balance} coins`);
      return balance;
    } catch (error) {
      logError(context, error, { userId });
      return 0;
    }
  }

  // ✅ ENHANCED - Deduct coins from user (atomic transaction)
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
      
      // Ensure user exists before transaction
      await this.ensureUserExists(userId);
      
      const result = await db.runTransaction(async (transaction) => {
        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userDocRef);
        
        if (!userDoc.exists) {
          throw new Error('User document not found in transaction');
        }
        
        const userData = userDoc.data();
        const currentCoins = userData?.coins || 0;
        
        logInfo(context, `Current balance: ${currentCoins} coins`);
        
        if (currentCoins < amount) {
          throw new Error(`Insufficient coins: has ${currentCoins}, needs ${amount}`);
        }
        
        const newBalance = currentCoins - amount;
        
        // Update with comprehensive tracking
        transaction.update(userDocRef, { 
          coins: newBalance,
          lastCoinUpdate: timestamp,
          lastCoinAction: 'deduct',
          [`${feature}LastUsed`]: timestamp, // Track when this feature was last used
          [`${feature}UsageCount`]: (userData[`${feature}UsageCount`] || 0) + 1 // Track usage count
        });
        
        logSuccess(context, `Transaction successful: ${currentCoins} → ${newBalance} coins`);
        return { newBalance, beforeBalance: currentCoins };
      });

      // Enhanced transaction logging
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
      } catch (transactionLogError) {
        logError(context, transactionLogError, { userId, amount, feature, phase: 'logging' });
        // Don't fail the main operation if logging fails
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
      
      // Enhanced error response with user-friendly messages
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
      
      // Log failed transaction
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
        // Silent fail for logging errors
      }
      
      return { 
        success: false, 
        newBalance: 0, 
        error: userFriendlyError,
        timestamp
      };
    }
  }

  // ✅ ENHANCED - Add coins to user (for admin/rewards/bonuses)
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
      
      const result = await db.runTransaction(async (transaction) => {
        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userDocRef);
        
        let currentCoins = 0;
        let beforeBalance = 0;
        
        if (!userDoc.exists) {
          // Create user document if it doesn't exist
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
        
        // Update with comprehensive tracking
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

      // Enhanced transaction logging
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
      } catch (transactionLogError) {
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
      
      // Log failed transaction
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
      } catch (logError) {
        // Silent fail for logging errors
      }
      
      return { 
        success: false, 
        newBalance: 0, 
        error: error.message || 'Failed to add coins',
        timestamp
      };
    }
  }

  // ✅ ENHANCED - Get user's transaction history with filters
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
      
      let query = db
        .collection('coinTransactions')
        .where('userId', '==', userId);
      
      // Add action filter if specified
      if (action) {
        query = query.where('action', '==', action);
      }
      
      const transactionsQuery = await query
        .orderBy('timestamp', 'desc')
        .limit(Math.min(limit, 100)) // Cap at 100 for performance
        .get();

      const transactions: TransactionRecord[] = transactionsQuery.docs.map(doc => {
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

  // ✅ ENHANCED - Initialize user coins (signup bonus)
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

      // Use addCoins method for consistency
      const result = await this.addCoins(userId, initialCoins, reason as any, `Initial coins for new user: ${initialCoins} coins`);
      
      if (result.success) {
        // Mark as initialized
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

  // 🆕 NEW - Get coin statistics for analytics
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
        this.getUserTransactions(userId, 100) // Get more transactions for better stats
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
            
            // Track feature usage
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

      // Sort features by usage
      const topFeatures = Object.entries(featureUsage)
        .map(([feature, data]) => ({ feature, ...data }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5); // Top 5 features

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

  // 🆕 NEW - Bulk operations for admin
  static async bulkAddCoins(
    operations: Array<{ userId: string; amount: number; reason: string; description?: string }>
  ): Promise<{ success: boolean; results: Array<{ userId: string; success: boolean; error?: string }> }> {
    const context = 'bulkAddCoins';
    const results: Array<{ userId: string; success: boolean; error?: string }> = [];
    
    try {
      logInfo(context, `Starting bulk coin addition for ${operations.length} users`);
      
      // Process in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (op) => {
          try {
            const result = await this.addCoins(op.userId, op.amount, op.reason as any, op.description);
            return {
              userId: op.userId,
              success: result.success,
              error: result.error
            };
          } catch (error: any) {
            return {
              userId: op.userId,
              success: false,
              error: error.message || 'Unknown error'
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < operations.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      logSuccess(context, `Bulk operation completed: ${successCount} succeeded, ${failureCount} failed`);
      return { success: true, results };
      
    } catch (error: any) {
      logError(context, error, { operationCount: operations.length });
      return { 
        success: false, 
        results: operations.map(op => ({ 
          userId: op.userId, 
          success: false, 
          error: 'Bulk operation failed' 
        }))
      };
    }
  }
}

// 🔧 HEALTH CHECK FUNCTION
export async function healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
  try {
    // Test database connection
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
  } catch (error) {
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
