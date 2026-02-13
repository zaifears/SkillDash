'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFirestore,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
  getDoc,
  Unsubscribe
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { getUpcomingHolidays } from '@/lib/bangladeshHolidays';
import { getFreshToken } from '@/lib/firebase';

// =====================================================
// PRECISION MONEY MATH UTILITIES
// Converts to paisa (integer) to avoid floating-point errors
// =====================================================
const toPaisa = (amount: number): number => Math.round(amount * 100);
const fromPaisa = (paisa: number): number => paisa / 100;

/**
 * Safe multiplication for money: price * quantity
 * Converts to integer paisa, multiplies, then converts back
 */
const moneyMultiply = (price: number, quantity: number): number => {
  return fromPaisa(toPaisa(price) * quantity);
};

/**
 * Safe addition/subtraction for money
 */
const moneyAdd = (a: number, b: number): number => {
  return fromPaisa(toPaisa(a) + toPaisa(b));
};

const moneySubtract = (a: number, b: number): number => {
  return fromPaisa(toPaisa(a) - toPaisa(b));
};

/**
 * Round money to 2 decimal places safely
 */
const roundMoney = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

export interface Stock {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  category?: string; // DSE stock category: A, B, N, or Z
}

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  totalCost: number;
  purchaseDate: string; // ISO date string - earliest purchase date for T+1 rule
}

export interface SimulatorState {
  balance: number;
  portfolio: PortfolioItem[];
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  gainLossPercent: number;
  realizedGainLoss: number;
}

export interface MarketInfo {
  stocks: Stock[];
  lastUpdated: string;
  totalStocks: number;
}

/**
 * DSE Stock Simulator Hook
 * Note: This simulator uses fake virtual currency (Fake BDT) for educational purposes only.
 * No real money or actual stocks are involved.
 */
export const useSimulator = () => {
  const { user } = useAuth();
  const db = getFirestore();
  
  // Market state
  // NOTE: Initial balance is 10,000 Fake BDT (virtual currency for simulator)
  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
  const [simulatorState, setSimulatorState] = useState<SimulatorState>({
    balance: 10000,
    portfolio: [],
    totalInvested: 0,
    totalCurrentValue: 0,
    totalGainLoss: 0,
    gainLossPercent: 0,
    realizedGainLoss: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionMessage, setTransactionMessage] = useState('');
  const [bangladeshHolidays, setBangladeshHolidays] = useState<string[]>([]);
  
  // Unsubscribe refs to prevent memory leaks
  const marketUnsubscribe = useRef<Unsubscribe | null>(null);
  const stateUnsubscribe = useRef<Unsubscribe | null>(null);

  // Load Bangladesh holidays on mount
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const holidays = await getUpcomingHolidays();
        setBangladeshHolidays(holidays);
      } catch (err) {
        console.warn('Failed to load holidays:', err);
        // Continue without holidays - market will still work with day-of-week logic
        setBangladeshHolidays([]);
      }
    };

    loadHolidays();
  }, []);

  // Listen to market data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'skilldash-dse-v1';
      const marketRef = doc(db, 'artifacts', appId, 'public', 'data', 'market_info', 'latest');
      
      marketUnsubscribe.current = onSnapshot(
        marketRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setMarketInfo(snapshot.data() as MarketInfo);
          } else {
            setMarketInfo({ stocks: [], lastUpdated: new Date().toISOString(), totalStocks: 0 });
          }
        },
        (err) => {
          console.error('Error listening to market data:', err);
          setError('Failed to load market data');
        }
      );
    } catch (err) {
      console.error('Error setting up market listener:', err);
      setError('Failed to initialize market listener');
    }

    return () => {
      if (marketUnsubscribe.current) {
        marketUnsubscribe.current();
      }
    };
  }, [user, db]);

  // Listen to user's simulator state
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'skilldash-dse-v1';
      const stateRef = doc(db, 'artifacts', appId, 'users', user.uid, 'simulator', 'state');
      
      stateUnsubscribe.current = onSnapshot(
        stateRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Omit<SimulatorState, 'totalCurrentValue' | 'totalGainLoss' | 'gainLossPercent'>;
            setSimulatorState(prev => ({
              ...data,
              portfolio: data.portfolio || [],
              realizedGainLoss: data.realizedGainLoss || 0,
              totalCurrentValue: calculatePortfolioValue(data.portfolio || [], marketInfo?.stocks || []),
              totalGainLoss: calculateGainLoss(data.portfolio || [], marketInfo?.stocks || []),
              gainLossPercent: calculateGainLossPercent(data.portfolio || [], marketInfo?.stocks || [])
            }));
          } else {
            // Initialize simulator state for new users
            initializeSimulatorState();
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error listening to simulator state:', err);
          setError('Failed to load simulator state');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up state listener:', err);
      setError('Failed to initialize state listener');
      setLoading(false);
    }

    return () => {
      if (stateUnsubscribe.current) {
        stateUnsubscribe.current();
      }
    };
  }, [user, db, marketInfo]);

  // Initialize simulator state for new users (only once per user)
  // New users start with 10,000 Fake BDT (virtual currency)
  const initializeSimulatorState = async () => {
    if (!user) return;

    try {
      const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'skilldash-dse-v1';
      const stateRef = doc(db, 'artifacts', appId, 'users', user.uid, 'simulator', 'state');
      
      // Get current state to check if already initialized
      const existingDoc = await getDoc(stateRef);
      
      // Only initialize if document doesn't exist yet
      if (!existingDoc.exists()) {
        const initialState: SimulatorState = {
          balance: 10000,
          portfolio: [],
          totalInvested: 0,
          totalCurrentValue: 0,
          totalGainLoss: 0,
          gainLossPercent: 0,
          realizedGainLoss: 0
        };
        
        // Use merge: true to ensure we only set initial values, never overwrite
        await setDoc(stateRef, initialState, { merge: true });
        setSimulatorState(initialState);
      }
    } catch (err) {
      console.error('Error initializing simulator state:', err);
      setError('Failed to initialize simulator state');
    }
  };

  // Calculate portfolio value based on current market prices (using safe money math)
  const calculatePortfolioValue = (portfolio: PortfolioItem[], stocks: Stock[]): number => {
    const totalPaisa = portfolio.reduce((total, item) => {
      const stock = stocks.find(s => s.symbol === item.symbol);
      return total + (stock ? toPaisa(stock.ltp) * item.quantity : 0);
    }, 0);
    return fromPaisa(totalPaisa);
  };

  // Calculate total gain/loss
  const calculateGainLoss = (portfolio: PortfolioItem[], stocks: Stock[]): number => {
    const currentValue = calculatePortfolioValue(portfolio, stocks);
    const invested = portfolio.reduce((total, item) => total + item.totalCost, 0);
    return currentValue - invested;
  };

  // Calculate gain/loss percentage
  const calculateGainLossPercent = (portfolio: PortfolioItem[], stocks: Stock[]): number => {
    const invested = portfolio.reduce((total, item) => total + item.totalCost, 0);
    if (invested === 0) return 0;
    const gainLoss = calculateGainLoss(portfolio, stocks);
    return (gainLoss / invested) * 100;
  };

  // Handle buy transaction
  // Commission rate: 0.3% on all transactions
  const COMMISSION_RATE = 0.003;
  
  const handleBuyTrade = useCallback(
    async (symbol: string, quantity: number) => {
      if (!user || !marketInfo) {
        setTransactionStatus('error');
        setTransactionMessage('User not authenticated or market data not loaded');
        return;
      }

      // FIX #3: Refresh token before critical financial operation
      const freshToken = await getFreshToken(true);
      if (!freshToken) {
        setTransactionStatus('error');
        setTransactionMessage('Authentication expired. Please refresh and try again.');
        return;
      }

      // Validation
      if (!Number.isInteger(quantity) || quantity <= 0) {
        setTransactionStatus('error');
        setTransactionMessage('Quantity must be a positive integer');
        return;
      }

      const stock = marketInfo.stocks.find(s => s.symbol === symbol);
      if (!stock) {
        setTransactionStatus('error');
        setTransactionMessage('Stock not found in market data');
        return;
      }

      // Use safe money math to avoid floating-point precision errors
      const stockCost = moneyMultiply(stock.ltp, quantity);
      const commission = roundMoney(stockCost * COMMISSION_RATE);
      const totalCost = moneyAdd(stockCost, commission);
      
      if (simulatorState.balance < totalCost) {
        setTransactionStatus('error');
        setTransactionMessage(`Insufficient balance. Required: ৳${totalCost.toFixed(2)} (incl. ৳${commission.toFixed(2)} commission), Available: ৳${simulatorState.balance.toFixed(2)}`);
        return;
      }

      setTransactionStatus('processing');
      setTransactionMessage('Processing buy order...');

      try {
        const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'skilldash-dse-v1';
        const stateRef = doc(db, 'artifacts', appId, 'users', user.uid, 'simulator', 'state');
        
        await runTransaction(db, async (transaction) => {
          const stateDoc = await transaction.get(stateRef);
          
          if (!stateDoc.exists()) {
            throw new Error('Simulator state not found');
          }

          const currentState = stateDoc.data() as SimulatorState;
          
          // Recalculate with commission in transaction for safety (using safe money math)
          const txStockCost = moneyMultiply(stock.ltp, quantity);
          const txCommission = roundMoney(txStockCost * COMMISSION_RATE);
          const txTotalCost = moneyAdd(txStockCost, txCommission);
          
          // Final validation in transaction
          if (currentState.balance < txTotalCost) {
            throw new Error('Insufficient balance for transaction (including commission)');
          }

          // Find or create portfolio item (using data from Firestore, not React state)
          const existingIndex = currentState.portfolio.findIndex(item => item.symbol === symbol);
          const newPortfolio = [...currentState.portfolio];

          if (existingIndex >= 0) {
            // Update existing position with safe money math
            const existing = newPortfolio[existingIndex];
            const newTotalCost = moneyAdd(existing.totalCost, txStockCost);
            const newQuantity = existing.quantity + quantity;
            newPortfolio[existingIndex] = {
              ...existing,
              quantity: newQuantity,
              averageBuyPrice: roundMoney(newTotalCost / newQuantity),
              totalCost: newTotalCost
            };
          } else {
            // Create new position
            newPortfolio.push({
              symbol,
              quantity,
              averageBuyPrice: stock.ltp,
              totalCost: txStockCost,
              purchaseDate: new Date().toISOString()
            });
          }

          // Update state - deduct total cost including commission (using safe money math)
          transaction.set(stateRef, {
            ...currentState,
            balance: moneySubtract(currentState.balance, txTotalCost),
            portfolio: newPortfolio,
            totalInvested: moneyAdd(currentState.totalInvested, txStockCost)
          });
        });

        const commission = stockCost * COMMISSION_RATE;
        setTransactionStatus('success');
        setTransactionMessage(`Bought ${quantity} ${symbol} for ৳${stockCost.toFixed(2)} + ৳${commission.toFixed(2)} commission`);

      } catch (err) {
        console.error('Buy trade error:', err);
        setTransactionStatus('error');
        setTransactionMessage(err instanceof Error ? err.message : 'Failed to execute buy order');
      }
    },
    [user, marketInfo, simulatorState.balance, db]
  );

  // Handle sell transaction
  const handleSellTrade = useCallback(
    async (symbol: string, quantity: number) => {
      if (!user || !marketInfo) {
        setTransactionStatus('error');
        setTransactionMessage('User not authenticated or market data not loaded');
        return;
      }

      // FIX #3: Refresh token before critical financial operation
      const freshToken = await getFreshToken(true);
      if (!freshToken) {
        setTransactionStatus('error');
        setTransactionMessage('Authentication expired. Please refresh and try again.');
        return;
      }

      // Validation
      if (!Number.isInteger(quantity) || quantity <= 0) {
        setTransactionStatus('error');
        setTransactionMessage('Quantity must be a positive integer');
        return;
      }

      const portfolioItem = simulatorState.portfolio.find(item => item.symbol === symbol);
      if (!portfolioItem || portfolioItem.quantity < quantity) {
        setTransactionStatus('error');
        setTransactionMessage(`Insufficient quantity. You have ${portfolioItem?.quantity || 0} share(s)`);
        return;
      }

      // T+1 Settlement Rule: Cannot sell shares bought today
      if (portfolioItem.purchaseDate) {
        const purchaseDate = new Date(portfolioItem.purchaseDate);
        const now = new Date();
        // Use Bangladesh timezone for consistent date comparison
        const bdOptions = { timeZone: 'Asia/Dhaka' };
        const purchaseDateStr = purchaseDate.toLocaleDateString('en-CA', bdOptions); // YYYY-MM-DD format
        const todayDateStr = now.toLocaleDateString('en-CA', bdOptions);
        
        if (purchaseDateStr === todayDateStr) {
          setTransactionStatus('error');
          setTransactionMessage('T+1 Rule: You cannot sell shares on the same day of purchase. Please wait until tomorrow.');
          return;
        }
      }

      const stock = marketInfo.stocks.find(s => s.symbol === symbol);
      if (!stock) {
        setTransactionStatus('error');
        setTransactionMessage('Stock not found in market data');
        return;
      }

      // Use safe money math to avoid floating-point precision errors
      const grossProceeds = moneyMultiply(stock.ltp, quantity);
      const commission = roundMoney(grossProceeds * COMMISSION_RATE);
      const netProceeds = moneySubtract(grossProceeds, commission);

      setTransactionStatus('processing');
      setTransactionMessage('Processing sell order...');

      try {
        const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'skilldash-dse-v1';
        const stateRef = doc(db, 'artifacts', appId, 'users', user.uid, 'simulator', 'state');
        
        await runTransaction(db, async (transaction) => {
          const stateDoc = await transaction.get(stateRef);
          
          if (!stateDoc.exists()) {
            throw new Error('Simulator state not found');
          }

          // Use data from Firestore transaction (not React state) to prevent race conditions
          const currentState = stateDoc.data() as SimulatorState;
          const portfolio = [...currentState.portfolio];
          const itemIndex = portfolio.findIndex(item => item.symbol === symbol);

          if (itemIndex < 0 || portfolio[itemIndex].quantity < quantity) {
            throw new Error('Insufficient shares to sell');
          }

          const firestoreItem = portfolio[itemIndex];
          
          // Calculate realized gain/loss for this sale
          // Realized P&L = (Sell Price - Avg Buy Price) * Quantity - Commission
          const txGrossProceeds = moneyMultiply(stock.ltp, quantity);
          const txCommission = roundMoney(txGrossProceeds * COMMISSION_RATE);
          const txNetProceeds = moneySubtract(txGrossProceeds, txCommission);
          const costBasis = moneyMultiply(firestoreItem.averageBuyPrice, quantity);
          const txRealizedGain = moneySubtract(txNetProceeds, costBasis);

          // Update portfolio with safe money math
          if (firestoreItem.quantity === quantity) {
            // Remove item if selling all shares
            portfolio.splice(itemIndex, 1);
          } else {
            // Update quantity with safe money math
            portfolio[itemIndex] = {
              ...firestoreItem,
              quantity: firestoreItem.quantity - quantity,
              totalCost: moneySubtract(firestoreItem.totalCost, costBasis)
            };
          }

          // Update state - add net proceeds (after commission) using safe money math
          // Accumulate realized gain/loss
          transaction.set(stateRef, {
            ...currentState,
            balance: moneyAdd(currentState.balance, txNetProceeds),
            portfolio,
            totalInvested: moneySubtract(currentState.totalInvested, costBasis),
            realizedGainLoss: moneyAdd(currentState.realizedGainLoss || 0, txRealizedGain)
          });
        });

        setTransactionStatus('success');
        setTransactionMessage(`Sold ${quantity} ${symbol} for ৳${grossProceeds.toFixed(2)} - ৳${commission.toFixed(2)} commission = ৳${netProceeds.toFixed(2)}`);


      } catch (err) {
        console.error('Sell trade error:', err);
        setTransactionStatus('error');
        setTransactionMessage(err instanceof Error ? err.message : 'Failed to execute sell order');
      }
    },
    [user, marketInfo, simulatorState.portfolio, db]
  );

  // Check if market is open (10:00 AM - 2:15 PM Dhaka Time)
  const isMarketOpen = useCallback(() => {
    // Create a date in Bangladesh timezone (UTC+6)
    const now = new Date();
    const bdTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    
    const hour = bdTime.getHours();
    const minute = bdTime.getMinutes();
    const dayOfWeek = bdTime.getDay();
    
    // Format date as YYYY-MM-DD without timezone conversion issues
    const year = bdTime.getFullYear();
    const month = String(bdTime.getMonth() + 1).padStart(2, '0');
    const day = String(bdTime.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Market is closed on Friday and Saturday
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return false;
    }

    // Market is closed on national holidays
    if (bangladeshHolidays.includes(dateStr)) {
      return false;
    }

    // Market hours: 10:00 AM to 2:15 PM (14:15)
    return (hour >= 10 && (hour < 14 || (hour === 14 && minute <= 15)));
  }, [bangladeshHolidays]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (marketUnsubscribe.current) {
        marketUnsubscribe.current();
      }
      if (stateUnsubscribe.current) {
        stateUnsubscribe.current();
      }
    };
  }, []);

  // Reset transaction status (used by modal dismiss)
  const resetTransaction = useCallback(() => {
    setTransactionStatus('idle');
    setTransactionMessage('');
  }, []);

  return {
    // State
    marketInfo,
    simulatorState,
    loading,
    error,
    transactionStatus,
    transactionMessage,
    
    // Functions
    handleBuyTrade,
    handleSellTrade,
    isMarketOpen,
    resetTransaction
  };
};
