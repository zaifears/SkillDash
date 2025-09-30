'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MessageBubble from '../../components/discover/MessageBubble';
import { CoinManager } from '@/lib/coinManager';
import InsufficientCoinsModal from '@/components/ui/InsufficientCoinsModal';
import { LoadingScreen, LoadingDots, Message } from '@/lib/components/shared';
import { ROUTES, MESSAGES, LIMITS } from '@/lib/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Lazy load SuggestionsCard for better performance
const SuggestionsCard = dynamic(() => import('../../components/discover/SuggestionsCard'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

interface SkillSuggestions {
  summary: string;
  topSkills: string[];
  skillsToDevelop: string[];
  suggestedCourses: { title: string; description: string }[];
  suggestedCareers: { title: string; fit: string; description: string }[];
  nextStep: 'resume' | 'jobs';
  forceEnd?: boolean;
  blocked?: boolean;
  coinDeducted?: boolean;
  newBalance?: number;
  fallback?: boolean;
  questionsAsked?: number;
  inappropriateCount?: number;
  provider?: string; // NEW: AI provider used
}

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Core conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillSuggestions | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  
  // Coin management state
  const [hasEnoughCoins, setHasEnoughCoins] = useState<boolean>(false);
  const [coinsChecked, setCoinsChecked] = useState<boolean>(false);
  const [coinCheckRetries, setCoinCheckRetries] = useState<number>(0);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);
  const [coinError, setCoinError] = useState<{currentCoins: number; requiredCoins: number} | null>(null);
  
  // 🛡️ ANTI-SPAM STATE MANAGEMENT (3-TRIGGER SYSTEM)
  const [isInputDisabled, setIsInputDisabled] = useState(true); // Start disabled until coins verified
  const [conversationBlocked, setConversationBlocked] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [maxWarningsReached, setMaxWarningsReached] = useState(false);
  const [blockReason, setBlockReason] = useState<string>('');
  
  // 🚦 NEW: Rate limiting state
  const [rateLimitError, setRateLimitError] = useState<{ message: string; retryAfter?: number } | null>(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0);
  
  // Session tracking
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [currentProvider, setCurrentProvider] = useState<string>(''); // NEW: Track AI provider
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdCounter = useRef(0);
  const coinCheckAttempted = useRef(false);

  // Auth redirect effect
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', MESSAGES.AUTH_REQUIRED);
      sessionStorage.setItem('redirectAfterLogin', ROUTES.DISCOVER);
      router.push(ROUTES.AUTH);
    }
  }, [user, loading, router]);

  // 🪙 ROBUST COIN CHECK WITH PROPER STATE MANAGEMENT
  useEffect(() => {
    const performCoinCheck = async () => {
      if (user && !coinCheckAttempted.current) {
        coinCheckAttempted.current = true;
        
        console.log('🪙 [DiscoverPage] Validating coin balance...');
        
        try {
          // Allow time for Firebase connection to stabilize
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Direct Firebase check for most reliable result
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            console.error('❌ [DiscoverPage] User document not found');
            setCoinsChecked(true);
            setHasEnoughCoins(false);
            setIsInputDisabled(true);
            return;
          }
          
          const userData = userDoc.data();
          const directCoinBalance = userData?.coins || 0;
          const actualHasEnough = directCoinBalance >= LIMITS.COINS_PER_FEATURE;
          
          console.log(`💰 [DiscoverPage] Coin validation: ${directCoinBalance} >= ${LIMITS.COINS_PER_FEATURE} = ${actualHasEnough}`);
          
          // Set states based on coin availability
          if (actualHasEnough) {
            setHasEnoughCoins(true);
            setIsInputDisabled(false); // Enable input when coins available
            setShowInsufficientCoinsModal(false);
            setCoinError(null);
          } else {
            setHasEnoughCoins(false);
            setIsInputDisabled(true); // Keep input disabled when no coins
            setCoinError({ 
              currentCoins: directCoinBalance, 
              requiredCoins: LIMITS.COINS_PER_FEATURE 
            });
            setShowInsufficientCoinsModal(true);
          }
          
          setCoinsChecked(true);
          
        } catch (error: any) {
          console.error('❌ [DiscoverPage] Coin validation failed:', error);
          
          // Retry logic for network issues
          if (coinCheckRetries < 3) {
            console.log(`🔄 [DiscoverPage] Retrying coin check (${coinCheckRetries + 1}/3)`);
            setCoinCheckRetries(prev => prev + 1);
            coinCheckAttempted.current = false;
            return;
          }
          
          // After retries failed, assume no coins for security
          console.log('🚫 [DiscoverPage] Max retries reached - disabling chat');
          setCoinsChecked(true);
          setHasEnoughCoins(false);
          setIsInputDisabled(true);
        }
      }
    };

    performCoinCheck();
  }, [user, coinCheckRetries]);

  // 🚦 NEW: Rate limit countdown effect
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (rateLimitCountdown > 0) {
      countdownInterval = setInterval(() => {
        setRateLimitCountdown(prev => {
          if (prev <= 1) {
            setRateLimitError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [rateLimitCountdown]);

  // 🔄 Periodic coin refresh for better UX
  useEffect(() => {
    let coinRefreshInterval: NodeJS.Timeout;
    
    if (user && !hasEnoughCoins && coinsChecked && !conversationBlocked) {
      // Check for coins every 5 seconds if user doesn't have enough
      coinRefreshInterval = setInterval(async () => {
        try {
          const currentBalance = await CoinManager.getCoinBalance(user.uid);
          const hasCoins = currentBalance >= LIMITS.COINS_PER_FEATURE;
          
          if (hasCoins && !hasEnoughCoins) {
            console.log('✨ [DiscoverPage] Coins detected during periodic check');
            setHasEnoughCoins(true);
            setIsInputDisabled(false);
            setShowInsufficientCoinsModal(false);
            setCoinError(null);
            
            // Initialize conversation if no messages yet
            if (messages.length === 0) {
              setMessages([{
                id: 'welcome-coins-detected',
                role: 'assistant',
                content: "Great! I see you now have coins. Let's discover your perfect career path! 🌟\n\nLet's start: What's a skill or activity that you've always been curious about but never had the chance to explore properly?"
              }]);
            }
          }
        } catch (error) {
          console.error('❌ [DiscoverPage] Periodic coin check failed:', error);
        }
      }, 5000);
    }
    
    return () => {
      if (coinRefreshInterval) {
        clearInterval(coinRefreshInterval);
      }
    };
  }, [user, hasEnoughCoins, coinsChecked, messages.length, conversationBlocked]);

  // 👀 Tab focus coin check for instant refresh when user returns
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user && !hasEnoughCoins && coinsChecked && !conversationBlocked) {
        try {
          const currentBalance = await CoinManager.getCoinBalance(user.uid);
          const hasCoins = currentBalance >= LIMITS.COINS_PER_FEATURE;
          
          if (hasCoins) {
            console.log('🎉 [DiscoverPage] Coins found on tab focus');
            setHasEnoughCoins(true);
            setIsInputDisabled(false);
            setShowInsufficientCoinsModal(false);
            setCoinError(null);
            
            if (messages.length === 0) {
              setMessages([{
                id: 'welcome-tab-focus',
                role: 'assistant',
                content: "Welcome back! Ready to discover your career potential? 🌟\n\nFirst question: What type of work makes you feel energized rather than drained?"
              }]);
            }
          }
        } catch (error) {
          console.error('❌ [DiscoverPage] Tab focus coin check failed:', error);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [user, hasEnoughCoins, coinsChecked, messages.length, conversationBlocked]);

  // Auto-focus input when enabled
  useEffect(() => {
    if (!isLoading && !isInputDisabled && hasEnoughCoins && coinsChecked && inputRef.current && !conversationBlocked && rateLimitCountdown === 0) {
      inputRef.current.focus();
    }
  }, [isLoading, isInputDisabled, hasEnoughCoins, coinsChecked, conversationBlocked, rateLimitCountdown]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions, scrollToBottom]);

  // Initialize conversation ONLY when has coins
  useEffect(() => {
    if (user && messages.length === 0 && !conversationBlocked && hasEnoughCoins && coinsChecked) {
      setMessages([{
        id: 'welcome-initial',
        role: 'assistant',
        content: "Hi there! I'm SkillDashAI, your personal career guide. 🌟\n\nLet's start with something fun: If you had a completely free weekend to work on any project you wanted, what would you build or create? (Don't worry about being 'practical' - dream big! ✨)"
      }]);
    }
  }, [user, messages.length, conversationBlocked, hasEnoughCoins, coinsChecked]);

  // 📝 MAIN FORM SUBMISSION HANDLER WITH 3-TRIGGER ANTI-SPAM + RATE LIMITING
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation
    if (!userInput.trim() || isLoading || suggestions || conversationEnded || isInputDisabled || conversationBlocked || !hasEnoughCoins || maxWarningsReached || rateLimitCountdown > 0) {
      console.log('🚫 [DiscoverPage] Submit blocked:', {
        hasInput: !!userInput.trim(),
        isLoading,
        suggestions: !!suggestions,
        conversationEnded,
        isInputDisabled,
        conversationBlocked,
        hasEnoughCoins,
        maxWarningsReached,
        rateLimitActive: rateLimitCountdown > 0
      });
      return;
    }

    const userMessage: Message = { 
      id: `msg-${++messageIdCounter.current}`, 
      role: 'user', 
      content: userInput.trim() 
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);
    setRateLimitError(null); // Clear any previous rate limit errors

    try {
      console.log('📤 [DiscoverPage] Sending message to API...');
      
      const response = await fetch('/api/discover-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(({ id, ...msg }) => msg),
          userId: user?.uid
        }),
      });

      // 🚦 NEW: Handle rate limiting (429)
      if (response.status === 429) {
        console.log('🚦 [DiscoverPage] Rate limit exceeded');
        const rateLimitData = await response.json();
        const retryAfter = rateLimitData.retryAfter || parseInt(response.headers.get('Retry-After') || '60');
        
        setRateLimitError({
          message: rateLimitData.error || 'Too many requests. Please slow down.',
          retryAfter
        });
        setRateLimitCountdown(retryAfter);
        
        // Remove the user message since it wasn't processed
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      // Handle authentication errors
      if (response.status === 401) {
        console.log('🔐 [DiscoverPage] Authentication required');
        sessionStorage.setItem('redirectMessage', 'Please log in to continue with Discover.');
        sessionStorage.setItem('redirectAfterLogin', ROUTES.DISCOVER);
        router.push(ROUTES.AUTH);
        return;
      }

      // Handle coin errors from backend
      if (response.status === 402) {
        console.log('🪙 [DiscoverPage] Backend reports insufficient coins');
        const coinData = await response.json();
        
        // Update local coin state to match backend
        const currentBalance = coinData.currentCoins || await CoinManager.getCoinBalance(user.uid);
        setHasEnoughCoins(false);
        setIsInputDisabled(true);
        
        setCoinError({ 
          currentCoins: currentBalance,
          requiredCoins: coinData.coinsNeeded || LIMITS.COINS_PER_FEATURE 
        });
        setShowInsufficientCoinsModal(true);
        
        // Remove the user message since it wasn't processed
        setMessages(prev => prev.slice(0, -1));
        return;
      }
      
      // ✅ FIX: Handle the 400 "Blocked" error from the backend
      if (response.status === 400) {
        console.log('🚫 [DiscoverPage] Received block signal from backend');
        const errorData = await response.json();
        
        setConversationEnded(true);
        setIsInputDisabled(true);
        setConversationBlocked(true);
        setMaxWarningsReached(true);
        setBlockReason(errorData.error || 'Multiple inappropriate responses (3/3 strikes)');
        
        const endMessage: Message = { 
          id: `bot-${++messageIdCounter.current}`,
          role: 'assistant', 
          content: errorData.summary || "This conversation has been terminated."
        };
        setMessages(prev => [...prev, endMessage]);
        setIsLoading(false);
        return; // Stop further execution
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const botMessageId = `bot-${++messageIdCounter.current}`;

      // NEW: Track AI provider
      if (data.provider) {
        setCurrentProvider(data.provider);
        console.log(`🤖 [DiscoverPage] Response from: ${data.provider}`);
      }

      // 🛡️ HANDLE BLOCKED CONVERSATIONS (3-TRIGGER SYSTEM)
      if (data.isComplete && (data.forceEnd || data.blocked)) {
        console.log('🚫 [DiscoverPage] Conversation blocked by backend after 3 inappropriate responses');
        setConversationEnded(true);
        setIsInputDisabled(true);
        setConversationBlocked(true);
        setMaxWarningsReached(true);
        setBlockReason('Multiple inappropriate responses (3/3 strikes)');
        
        const endMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: data.summary || "This conversation has been terminated due to repeated inappropriate responses. Please start a new session when you're ready to engage seriously with your career discovery! 🛑"
        };
        setMessages(prev => [...prev, endMessage]);
        return;
      }

      // 🚨 HANDLE WARNING MESSAGES (TRACK TOWARDS 3-TRIGGER LIMIT)
      if (data.religiousWarning || data.spamWarning || data.aggressiveWarning) {
        const currentWarningCount = data.warningCount || data.inappropriateCount || 0;
        console.log(`⚠️ [DiscoverPage] Warning issued. Count: ${currentWarningCount}/3`);
        
        setWarningCount(currentWarningCount);
        
        // Check if we're approaching the limit
        if (currentWarningCount >= 3) {
          setMaxWarningsReached(true);
          setIsInputDisabled(true);
          setConversationBlocked(true);
          setBlockReason('Maximum warnings reached (3/3 strikes)');
        }
        
        const warningMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: data.reply 
        };
        setMessages(prev => [...prev, warningMessage]);
        return;
      }

      // Handle successful completion
      if (data.isComplete) {
        console.log('🎉 [DiscoverPage] Analysis completed successfully');
        setSuggestions(data);
        setConversationEnded(true);
        setIsInputDisabled(true); // Disable input after completion
        
        if (data.questionsAsked) {
          setQuestionsAsked(data.questionsAsked);
        }
        
        const finalBotMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: "Fantastic! Based on our chat, I've prepared a personalized analysis for you. Here are some exciting insights into your potential! 🎯" 
        };
        setMessages(prev => [...prev, finalBotMessage]);

        // Refresh coin balance if coin was deducted
        if (data.coinDeducted) {
          console.log('🪙 [DiscoverPage] Coin deducted - refreshing balance');
          setHasEnoughCoins(false); // User likely has no more coins after analysis
          if ((window as any).refreshCoinBalance) {
            (window as any).refreshCoinBalance();
          }
        }

      } else {
        // Continue conversation - track questions asked
        if (data.questionsAsked) {
          setQuestionsAsked(data.questionsAsked);
        }
        
        // Update warning count if provided
        if (data.warningCount !== undefined) {
          setWarningCount(data.warningCount);
        }
        
        const botMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: data.reply 
        };
        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error: any) {
      console.error('❌ [DiscoverPage] Chat error:', error);
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
      
      const errorMessage: Message = {
        id: `error-${++messageIdCounter.current}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet connection and try again. 🔄"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, suggestions, messages, conversationEnded, isInputDisabled, conversationBlocked, hasEnoughCoins, user, router, maxWarningsReached, rateLimitCountdown]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  }, []);

  // 🔄 RESTART CONVERSATION FUNCTION
  const handleRestart = useCallback(async () => {
    // Re-check coins before restart
    if (user) {
      try {
        const coinBalance = await CoinManager.getCoinBalance(user.uid);
        const hasCoins = coinBalance >= LIMITS.COINS_PER_FEATURE;
        
        if (!hasCoins) {
          setCoinError({ 
            currentCoins: coinBalance, 
            requiredCoins: LIMITS.COINS_PER_FEATURE 
          });
          setShowInsufficientCoinsModal(true);
          return;
        }
        
        setHasEnoughCoins(true);
        setIsInputDisabled(false);
      } catch (error) {
        console.error('❌ [DiscoverPage] Error checking coins on restart:', error);
        return;
      }
    }
    
    // Reset all state including anti-spam tracking and rate limiting
    setMessages([]);
    setUserInput('');
    setSuggestions(null);
    setConversationEnded(false);
    setIsInputDisabled(false);
    setConversationBlocked(false);
    setWarningCount(0);
    setMaxWarningsReached(false);
    setBlockReason('');
    setQuestionsAsked(0);
    setCoinError(null);
    setShowInsufficientCoinsModal(false);
    setRateLimitError(null);
    setRateLimitCountdown(0);
    setCurrentProvider('');
    
    // Re-initialize conversation
    setTimeout(() => {
      setMessages([{
        id: 'welcome-restart',
        role: 'assistant',
        content: "Welcome back! Ready for a fresh career discovery session? 🌟\n\nLet's dive in: What's a skill or activity that you've always been curious about but never had the chance to explore properly?"
      }]);
    }, 100);
  }, [user]);

  // Handle modal close with coin re-check
  const handleModalClose = useCallback(async () => {
    setShowInsufficientCoinsModal(false);
    setCoinError(null);
    
    // Re-check coins when modal closes
    if (user) {
      try {
        const coinBalance = await CoinManager.getCoinBalance(user.uid);
        const hasCoins = coinBalance >= LIMITS.COINS_PER_FEATURE;
        
        setHasEnoughCoins(hasCoins);
        setIsInputDisabled(!hasCoins);
        
        if (hasCoins && messages.length === 0) {
          setMessages([{
            id: 'welcome-after-coins',
            role: 'assistant',
            content: "Great! Now that you have coins, let's discover your perfect career path! 🌟\n\nFirst question: If you could spend a whole day learning any skill without worrying about difficulty or time, what would you choose?"
          }]);
        }
      } catch (error) {
        console.error('❌ [DiscoverPage] Error refreshing coins:', error);
      }
    }
  }, [user, messages.length]);

  // Loading states
  if (loading || !user) {
    return <LoadingScreen />;
  }

  if (!coinsChecked) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingDots />
            <p className="text-gray-600 dark:text-gray-400 mt-4">Checking your coin balance...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // 🔧 IMPROVED DISABLE LOGIC
  const inputFieldDisabled = !hasEnoughCoins || isInputDisabled || conversationBlocked || maxWarningsReached || rateLimitCountdown > 0;
  const submitButtonDisabled = isLoading || !userInput.trim() || !!suggestions || conversationEnded || isInputDisabled || conversationBlocked || !hasEnoughCoins || maxWarningsReached || rateLimitCountdown > 0;
  
  const getPlaceholder = () => {
    if (rateLimitCountdown > 0) return `Rate limit - wait ${rateLimitCountdown}s... ⏳`;
    if (!hasEnoughCoins) return "Need coins to chat - get coins first! 🪙";
    if (maxWarningsReached) return "Session blocked after 3 inappropriate responses 🚫";
    if (conversationBlocked) return "Session ended - restart to continue";
    if (suggestions) return "Your Skill Quest is complete! 🎉";
    if (conversationEnded) return "Analysis complete!";
    if (isInputDisabled) return "Please wait...";
    if (isLoading) return "Thinking...";
    return "Share your thoughts here...";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black font-sans antialiased pt-20">
      <header className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-black/5 p-4 sticky top-0 z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            SkillDash <span className="font-light bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Discover</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your Personal AI Career Guide 
            {hasEnoughCoins ? ' 🟢' : ' 🔴'}
            {questionsAsked > 0 && ` • Questions: ${questionsAsked}/10`}
            {warningCount > 0 && ` • Warnings: ${warningCount}/3`}
            {currentProvider && <span className="text-xs opacity-60"> • {currentProvider}</span>}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
        <div className="max-w-3xl mx-auto">
          
          {/* 🚦 NEW: RATE LIMIT BANNER */}
          {rateLimitError && rateLimitCountdown > 0 && (
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl p-6 mb-6 text-center shadow-lg border border-orange-500 animate-pulse">
              <div className="text-3xl mb-3">⏳</div>
              <h3 className="text-xl font-bold mb-3">Slow Down!</h3>
              <p className="text-sm opacity-90 mb-4">
                {rateLimitError.message}
              </p>
              <div className="text-4xl font-bold mb-2">{rateLimitCountdown}s</div>
              <p className="text-xs opacity-75">Please wait before sending another message</p>
            </div>
          )}
          
          {/* 🚫 BLOCKED CONVERSATION BANNER */}
          {(conversationBlocked || maxWarningsReached) && !conversationEnded && (
            <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl p-6 mb-6 text-center shadow-lg border border-red-500">
              <div className="text-3xl mb-3">🚫</div>
              <h3 className="text-xl font-bold mb-3">Session Terminated</h3>
              <p className="text-sm opacity-90 mb-4">
                {blockReason || 'This session has been terminated due to repeated inappropriate responses (3/3 strikes).'}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={handleRestart}
                  className="bg-white text-red-700 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors"
                >
                  🔄 Start New Session
                </button>
                <button
                  onClick={() => router.push('/coins')}
                  className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors"
                >
                  💰 Get More Coins
                </button>
              </div>
            </div>
          )}
          
          {/* COIN WARNING BANNER */}
          {!hasEnoughCoins && coinsChecked && !conversationBlocked && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-6 mb-6 text-center shadow-lg">
              <div className="text-2xl mb-2">🪙</div>
              <h3 className="text-lg font-bold mb-2">Coins Required for Career Discovery</h3>
              <p className="text-sm opacity-90 mb-4">
                You need {LIMITS.COINS_PER_FEATURE} coin to start your personalized career analysis with SkillDashAI.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => router.push('/coins')}
                  className="bg-white text-orange-600 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Get Coins Now
                </button>
              </div>
            </div>
          )}
          
          {/* 🔥 WARNING PROGRESS INDICATOR */}
          {warningCount > 0 && warningCount < 3 && !conversationBlocked && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <h4 className="font-semibold">Warning: {warningCount}/3 Strikes</h4>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(warningCount / 3) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs opacity-90">
                Please keep responses career-focused. {3 - warningCount} more inappropriate response{3 - warningCount !== 1 ? 's' : ''} will terminate this session.
              </p>
            </div>
          )}
          
          <div className="space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            
            {isLoading && <MessageBubble role="assistant" content={<LoadingDots />} />}
            {suggestions && !suggestions.forceEnd && <SuggestionsCard data={suggestions} />}
            
            {/* RESTART BUTTON for blocked conversations */}
            {(conversationBlocked || maxWarningsReached) && hasEnoughCoins && (
              <div className="text-center py-8">
                <button
                  onClick={handleRestart}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  🔄 Start New Session
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Begin fresh with a clean conversation
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-t border-black/5 p-2 fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder={getPlaceholder()}
              className={`input-field rounded-full transition-all duration-200 ${
                inputFieldDisabled
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-700' 
                  : 'hover:border-blue-400 focus:border-blue-500'
              }`}
              disabled={inputFieldDisabled}
              maxLength={LIMITS.MAX_MESSAGE_LENGTH}
            />
            <button
              type="submit"
              className={`rounded-full p-3 transition-all transform ${
                submitButtonDisabled
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed scale-95'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:scale-110 active:scale-100'
              }`}
              disabled={submitButtonDisabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          
          {/* STATUS INDICATORS */}
          {rateLimitCountdown > 0 && (
            <div className="text-center mt-2">
              <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                ⏳ Rate limit active - wait {rateLimitCountdown}s before sending
              </p>
            </div>
          )}
          
          {!hasEnoughCoins && coinsChecked && !conversationBlocked && (
            <div className="text-center mt-2">
              <p className="text-xs text-red-600 dark:text-red-400">
                🪙 Need {LIMITS.COINS_PER_FEATURE} coin to start career discovery
              </p>
            </div>
          )}
          
          {warningCount > 0 && !conversationBlocked && hasEnoughCoins && warningCount < 3 && rateLimitCountdown === 0 && (
            <div className="text-center mt-2">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ {warningCount}/3 warnings - Please provide career-focused responses
              </p>
            </div>
          )}
          
          {(conversationBlocked || maxWarningsReached) && (
            <div className="text-center mt-2">
              <p className="text-xs text-red-600 dark:text-red-400">
                🚫 Session terminated - 3 inappropriate responses reached
              </p>
            </div>
          )}
          
          {questionsAsked > 0 && questionsAsked < 10 && !conversationEnded && hasEnoughCoins && !conversationBlocked && rateLimitCountdown === 0 && (
            <div className="text-center mt-2">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                📊 Question {questionsAsked}/10 - Analysis will be ready soon!
              </p>
            </div>
          )}
          
          {currentProvider && questionsAsked > 0 && (
            <div className="text-center mt-1">
              <p className="text-xs text-gray-400 dark:text-gray-600">
                Powered by {currentProvider}
              </p>
            </div>
          )}
        </div>
      </footer>

      {/* Insufficient Coins Modal */}
      {showInsufficientCoinsModal && coinError && (
        <InsufficientCoinsModal
          isOpen={showInsufficientCoinsModal}
          onClose={handleModalClose}
          featureName="Discover Career Paths"
          currentCoins={coinError.currentCoins}
          requiredCoins={coinError.requiredCoins}
        />
      )}
    </div>
  );
}