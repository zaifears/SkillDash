// lib/coinManagerServer.ts - SERVER-SIDE Coin Management with Enhanced Error Logging
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// 🔍 ENHANCED LOGGING UTILITY
const logError = (context: string, error: any, additionalData?: any) => {
  console.error(`❌ [CoinManagerServer] ${context}:`, {
    message: error.message,
    stack: error.stack,
    code: error.code,
    name: error.name,
    ...additionalData
  });
};

const logInfo = (context: string, message: string, data?: any) => {
  console.log(`🔍 [CoinManagerServer] ${context}: ${message}`, data || '');
};

const logSuccess = (context: string, message: string, data?: any) => {
  console.log(`✅ [CoinManagerServer] ${context}: ${message}`, data || '');
};

// 🔧 CORRECTED SERVICE ACCOUNT WITH YOUR EXACT PRIVATE KEY
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

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  try {
    logInfo('INIT', 'Starting Firebase Admin initialization...');
    logInfo('INIT', 'Service account configured, initializing app...');

    initializeApp({
      credential: cert(serviceAccount as any),
    });

    logSuccess('INIT', 'Firebase Admin initialized successfully');
  } catch (error) {
    logError('INIT', error, { 
      serviceAccountKeys: Object.keys(serviceAccount || {}),
      appsLength: getApps().length,
      env: process.env.NODE_ENV
    });
    throw new Error(`Firebase Admin initialization failed: ${error.message}`);
  }
}

let db: any;
try {
  db = getFirestore();
  logSuccess('DB', 'Firestore connection established');
} catch (error) {
  logError('DB', error);
  throw new Error(`Firestore connection failed: ${error.message}`);
}

export class CoinManagerServer {
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
      
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        logError(context, new Error('User document not found'), { userId, requiredCoins });
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

  // Get user's current coin balance
  static async getCoinBalance(userId: string): Promise<number> {
    const context = 'getCoinBalance';
    
    try {
      if (!userId) {
        logError(context, new Error('userId is required'), { userId });
        return 0;
      }

      logInfo(context, `Getting coin balance for user ${userId}...`);
      
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        logError(context, new Error('User document not found'), { userId });
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

  // Deduct coins from user (atomic transaction)
  static async deductCoins(
    userId: string, 
    amount: number = 1, 
    feature: 'resume-feedback' | 'discover',
    description?: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const context = 'deductCoins';
    
    try {
      if (!userId) {
        const error = 'userId is required';
        logError(context, new Error(error), { userId, amount, feature });
        return { success: false, newBalance: 0, error };
      }
      
      if (typeof amount !== 'number' || amount <= 0) {
        const error = 'Invalid amount - must be positive number';
        logError(context, new Error(error), { userId, amount, feature });
        return { success: false, newBalance: 0, error };
      }
      
      if (!feature) {
        const error = 'feature is required';
        logError(context, new Error(error), { userId, amount, feature });
        return { success: false, newBalance: 0, error };
      }

      logInfo(context, `Starting coin deduction: ${amount} coins for ${feature} (user: ${userId})`);
      
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
        transaction.update(userDocRef, { coins: newBalance });
        
        logSuccess(context, `Transaction successful: ${currentCoins} → ${newBalance} coins`);
        return newBalance;
      });

      // Log the transaction
      try {
        await db.collection('coinTransactions').add({
          userId,
          amount,
          action: 'deduct',
          feature,
          timestamp: new Date(),
          success: true,
          description: description || `Used ${amount} coin(s) for ${feature.replace('-', ' ')}`
        });
        logSuccess(context, 'Transaction logged successfully');
      } catch (transactionLogError) {
        logError(context, transactionLogError, { userId, amount, feature, phase: 'logging' });
      }

      logSuccess(context, `Successfully deducted ${amount} coin(s) for ${feature}. New balance: ${result}`);
      return { success: true, newBalance: result };
      
    } catch (error: any) {
      logError(context, error, { userId, amount, feature, description });
      
      return { 
        success: false, 
        newBalance: 0, 
        error: error.message || 'Failed to deduct coins'
      };
    }
  }
}
