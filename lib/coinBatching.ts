// Coin operation batching for atomic transactions
import { collection, writeBatch, doc, getDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export interface CoinBatchOperation {
  type: 'add' | 'deduct' | 'log' | 'updateProfile';
  userId?: string;
  amount?: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface BatchOperationResult {
  success: boolean;
  message: string;
  newBalance?: number;
  transactionId?: string;
}

/**
 * Execute multiple coin operations atomically
 * All operations succeed or all fail together - no partial updates
 */
export async function executeCoinBatch(
  operations: CoinBatchOperation[]
): Promise<BatchOperationResult> {
  if (!operations.length) {
    return { success: false, message: 'No operations provided' };
  }

  try {
    const batch = writeBatch(db);
    let userBalance = 0;
    let totalCoinsChanged = 0;
    const userId = operations[0].userId;

    if (!userId) {
      return { success: false, message: 'User ID required' };
    }

    // Pre-flight: Calculate total coins needed for all deductions
    let totalCoinsNeeded = 0;
    for (const op of operations) {
      if (op.type === 'deduct' && op.amount) {
        totalCoinsNeeded += op.amount;
      }
    }

    // Check user has sufficient balance for ALL deductions
    if (totalCoinsNeeded > 0) {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return { success: false, message: 'User not found' };
      }
      const currentBalance = userSnap.data().coins || 0;
      if (currentBalance < totalCoinsNeeded) {
        return { success: false, message: `Insufficient coins: has ${currentBalance}, needs ${totalCoinsNeeded}` };
      }
    }

    // Execute all operations atomically
    for (const op of operations) {
      const userRef = doc(db, 'users', userId);
      const txnRef = doc(collection(db, 'coinTransactions'));

      switch (op.type) {
        case 'add':
          if (op.amount) {
            batch.update(userRef, { coins: increment(op.amount) });
            totalCoinsChanged += op.amount;
            
            // Log transaction
            batch.set(txnRef, {
              userId,
              type: 'add',
              amount: op.amount,
              description: op.description || 'Coin addition',
              timestamp: new Date().toISOString(),
              metadata: op.metadata || {}
            });
          }
          break;

        case 'deduct':
          if (op.amount) {
            batch.update(userRef, { coins: increment(-op.amount) });
            totalCoinsChanged -= op.amount;
            
            // Log transaction
            batch.set(txnRef, {
              userId,
              type: 'deduct',
              amount: op.amount,
              description: op.description || 'Coin deduction',
              timestamp: new Date().toISOString(),
              metadata: op.metadata || {}
            });
          }
          break;

        case 'log':
          batch.set(txnRef, {
            userId,
            type: op.metadata?.type || 'other',
            description: op.description || 'Transaction log entry',
            timestamp: new Date().toISOString(),
            metadata: op.metadata || {}
          });
          break;
      }
    }

    // Commit all operations atomically
    await batch.commit();

    // Get updated balance
    const userRef = doc(db, 'users', userId);
    const updatedUserSnap = await getDoc(userRef);
    userBalance = updatedUserSnap.data()?.coins || 0;

    return {
      success: true,
      message: 'Batch operation completed successfully',
      newBalance: userBalance
    };
  } catch (error: any) {
    console.error('❌ Batch operation failed:', error);
    return {
      success: false,
      message: `Batch operation failed: ${error.message}`
    };
  }
}

/**
 * Queue coin operations and execute them with retry logic
 */
export class CoinBatchQueue {
  private queue: CoinBatchOperation[] = [];
  private processingPromise: Promise<BatchOperationResult> | null = null;
  private readonly maxRetries = 3;

  add(operation: CoinBatchOperation): void {
    this.queue.push(operation);
  }

  async flush(): Promise<BatchOperationResult> {
    // Fix #1: Use Promise-based locking instead of flag to prevent race conditions
    if (this.processingPromise) {
      return this.processingPromise;
    }

    if (!this.queue.length) {
      return { success: false, message: 'Queue is empty' };
    }

    this.processingPromise = this.executeFlush();
    try {
      return await this.processingPromise;
    } finally {
      this.processingPromise = null;
    }
  }

  private async executeFlush(): Promise<BatchOperationResult> {
    let result: BatchOperationResult = { success: false, message: 'Unknown error' };
    let attempts = 0;

    while (attempts < this.maxRetries && !result.success) {
      try {
        result = await executeCoinBatch(this.queue);
        if (result.success) {
          this.queue = []; // Clear queue on success
          return result;
        }
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed, retrying...`, error);
        attempts++;
        
        if (attempts < this.maxRetries) {
          // Exponential backoff: 500ms, 1000ms, 1500ms
          await new Promise(resolve => setTimeout(resolve, 500 * attempts));
        }
      }
    }

    // Fix #4: Always clear queue after retries exhausted
    if (!result.success) {
      console.warn('[CoinBatchQueue] All retries exhausted. Clearing failed operations from queue.');
      this.queue = [];
    }

    return result;
  }

  clear(): void {
    this.queue = [];
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}
