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

// Lazy load SuggestionsCard
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
}

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillSuggestions | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  
  // 🆕 COIN STATE - Main control for chat availability
  const [hasEnoughCoins, setHasEnoughCoins] = useState<boolean>(false);
  const [coinsChecked, setCoinsChecked] = useState<boolean>(false);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);
  const [coinError, setCoinError] = useState<{currentCoins: number; requiredCoins: number} | null>(null);
  
  // Anti-spam state
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [conversationBlocked, setConversationBlocked] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdCounter = useRef(0);

  // Auth redirect effect
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', MESSAGES.AUTH_REQUIRED);
      sessionStorage.setItem('redirectAfterLogin', ROUTES.DISCOVER);
      router.push(ROUTES.AUTH);
    }
  }, [user, loading, router]);

  // 🪙 CRITICAL - Check coins IMMEDIATELY when user is available
  useEffect(() => {
    const checkCoinsOnEntry = async () => {
      if (user && !coinsChecked) {
        console.log('🪙 Checking coins on Discover entry...');
        
        try {
          const coinBalance = await CoinManager.getCoinBalance(user.uid);
          const hasCoins = coinBalance >= LIMITS.COINS_PER_FEATURE;
          
          console.log(`💰 User has ${coinBalance} coins, needs ${LIMITS.COINS_PER_FEATURE}`);
          
          setHasEnoughCoins(hasCoins);
          setCoinsChecked(true);
          
          if (!hasCoins) {
            setCoinError({ 
              currentCoins: coinBalance, 
              requiredCoins: LIMITS.COINS_PER_FEATURE 
            });
            setShowInsufficientCoinsModal(true);
            setIsInputDisabled(true); // DISABLE TYPING
            console.log('❌ Insufficient coins - disabling chat');
          } else {
            setIsInputDisabled(false); // ENABLE TYPING
            console.log('✅ Sufficient coins - enabling chat');
          }
        } catch (error) {
          console.error('Error checking coins:', error);
          setCoinsChecked(true);
          setHasEnoughCoins(false);
          setIsInputDisabled(true);
        }
      }
    };

    checkCoinsOnEntry();
  }, [user, coinsChecked]);

  // Auto-focus input (only if coins are available)
  useEffect(() => {
    if (!isLoading && !isInputDisabled && hasEnoughCoins && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, isInputDisabled, hasEnoughCoins]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions, scrollToBottom]);

  // Initialize conversation ONLY if has coins
  useEffect(() => {
    if (user && messages.length === 0 && !conversationBlocked && hasEnoughCoins && coinsChecked) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi there! I'm SkillDashAI, your personal career guide. 🌟\n\nLet's start with something fun: If you had a completely free weekend to work on any project you wanted, what would you build or create? (Don't worry about being 'practical' - dream big! ✨)"
      }]);
    }
  }, [user, messages.length, conversationBlocked, hasEnoughCoins, coinsChecked]);

  // 🆕 SIMPLIFIED FORM SUBMISSION - No coin checks during chat
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || suggestions || conversationEnded || isInputDisabled || conversationBlocked || !hasEnoughCoins) {
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

    try {
      const response = await fetch('/api/discover-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(({ id, ...msg }) => msg),
          userId: user?.uid
        }),
      });

      // Handle authentication errors
      if (response.status === 401) {
        sessionStorage.setItem('redirectMessage', 'Please log in to continue with Discover.');
        sessionStorage.setItem('redirectAfterLogin', ROUTES.DISCOVER);
        router.push(ROUTES.AUTH);
        return;
      }

      // Handle coin errors (should not happen due to pre-check, but just in case)
      if (response.status === 402) {
        const coinData = await response.json();
        const currentBalance = await CoinManager.getCoinBalance(user.uid);
        
        setCoinError({ 
          currentCoins: currentBalance,
          requiredCoins: coinData.coinsNeeded || LIMITS.COINS_PER_FEATURE 
        });
        setShowInsufficientCoinsModal(true);
        setIsInputDisabled(true);
        
        // Remove the user message since it wasn't processed
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const botMessageId = `bot-${++messageIdCounter.current}`;

      // 🚨 HANDLE BLOCKED/FORCE ENDED CONVERSATIONS
      if (data.isComplete && (data.forceEnd || data.blocked)) {
        setConversationEnded(true);
        setIsInputDisabled(true);
        setConversationBlocked(true);
        
        const endMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: data.summary || "This conversation has been ended. You can start a new session anytime! 🔄"
        };
        setMessages(prev => [...prev, endMessage]);
        return;
      }

      // 🚨 HANDLE WARNING MESSAGES (Religious/Spam)
      if (data.religiousWarning || data.spamWarning) {
        setWarningCount(prev => prev + 1);
        
        const warningMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: data.reply 
        };
        setMessages(prev => [...prev, warningMessage]);
        return;
      }

      // ✅ HANDLE SUCCESSFUL COMPLETION
      if (data.isComplete) {
        setSuggestions(data);
        setConversationEnded(true);
        
        const finalBotMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: "Fantastic! Based on our chat, I've prepared a personalized analysis for you. Here are some exciting insights into your potential! 🎯" 
        };
        setMessages(prev => [...prev, finalBotMessage]);

        // Refresh coin balance if analysis completed and coin was deducted
        if (data.coinDeducted && (window as any).refreshCoinBalance) {
          (window as any).refreshCoinBalance();
          console.log('🪙 Coin deducted and balance refreshed');
        }

      } else {
        // ✅ CONTINUE CONVERSATION
        const botMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: data.reply 
        };
        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
      
      const errorMessage: Message = {
        id: `error-${++messageIdCounter.current}`,
        role: 'assistant',
        content: "Oops! I'm having a little trouble connecting right now. Please check your internet connection and try again. 🔄"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, suggestions, messages, conversationEnded, isInputDisabled, conversationBlocked, hasEnoughCoins, user, router]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  }, []);

  // 🆕 RESTART CONVERSATION FUNCTION
  const handleRestart = useCallback(async () => {
    // Re-check coins before restart
    if (user) {
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
    }
    
    setMessages([]);
    setUserInput('');
    setSuggestions(null);
    setConversationEnded(false);
    setIsInputDisabled(false);
    setConversationBlocked(false);
    setWarningCount(0);
    setCoinError(null);
    
    // Re-initialize conversation
    setMessages([{
      id: 'welcome-restart',
      role: 'assistant',
      content: "Welcome back! Ready for a fresh career discovery session? 🌟\n\nLet's dive in: What's a skill or activity that you've always been curious about but never had the chance to explore properly?"
    }]);
  }, [user]);

  // 🆕 HANDLE MODAL CLOSE - Re-check coins
  const handleModalClose = useCallback(async () => {
    setShowInsufficientCoinsModal(false);
    setCoinError(null);
    
    // Re-check coins when modal closes (in case user got coins)
    if (user) {
      const coinBalance = await CoinManager.getCoinBalance(user.uid);
      const hasCoins = coinBalance >= LIMITS.COINS_PER_FEATURE;
      
      setHasEnoughCoins(hasCoins);
      setIsInputDisabled(!hasCoins);
      
      if (hasCoins && messages.length === 0) {
        // Initialize conversation if now has coins
        setMessages([{
          id: 'welcome-after-coins',
          role: 'assistant',
          content: "Great! Now that you have coins, let's discover your perfect career path! 🌟\n\nFirst question: If you had a completely free weekend to work on any project you wanted, what would you build or create? (Dream big! ✨)"
        }]);
      }
    }
  }, [user, messages.length]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  // Show loading while checking coins
  if (!coinsChecked) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black">
        <div className="flex-1 flex items-center justify-center">
          <LoadingDots />
        </div>
      </div>
    );
  }
  
  const getPlaceholder = () => {
    if (!hasEnoughCoins) return "Need coins to chat - get coins first! 🪙";
    if (conversationBlocked) return "Session ended - restart to continue";
    if (suggestions) return "Your Skill Quest is complete! 🎉";
    if (conversationEnded) return "Analysis complete!";
    if (isInputDisabled) return "Please wait...";
    if (isLoading) return "Thinking...";
    return "Share your thoughts here...";
  };

  const isSubmitDisabled = isLoading || !userInput.trim() || !!suggestions || conversationEnded || isInputDisabled || conversationBlocked || !hasEnoughCoins;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black font-sans antialiased pt-20">
      <header className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-black/5 p-4 sticky top-0 z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            SkillDash <span className="font-light bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Discover</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your Personal AI Career Guide 
            {hasEnoughCoins ? '🟢' : '🔴'} {/* Coin status indicator */}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
        <div className="max-w-3xl mx-auto">
          
          {/* 🆕 NO COINS WARNING BANNER */}
          {!hasEnoughCoins && coinsChecked && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-6 mb-6 text-center shadow-lg">
              <div className="text-2xl mb-2">🪙</div>
              <h3 className="text-lg font-bold mb-2">Coins Required for Career Discovery</h3>
              <p className="text-sm opacity-90 mb-4">
                You need {LIMITS.COINS_PER_FEATURE} coin to start your personalized career analysis with SkillDashAI.
              </p>
              <button
                onClick={() => {
                  if (coinError) {
                    setShowInsufficientCoinsModal(true);
                  } else {
                    router.push('/coins');
                  }
                }}
                className="bg-white text-orange-600 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors"
              >
                Get Coins Now
              </button>
            </div>
          )}
          
          <div className="space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            
            {isLoading && <MessageBubble role="assistant" content={<LoadingDots />} />}
            {suggestions && !suggestions.forceEnd && <SuggestionsCard data={suggestions} />}
            
            {/* RESTART BUTTON for blocked conversations */}
            {conversationBlocked && hasEnoughCoins && (
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
                !hasEnoughCoins || isInputDisabled || conversationBlocked
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-700' 
                  : 'hover:border-blue-400 focus:border-blue-500'
              }`}
              disabled={isSubmitDisabled}
              maxLength={LIMITS.MAX_MESSAGE_LENGTH}
            />
            <button
              type="submit"
              className={`rounded-full p-3 transition-all transform ${
                isSubmitDisabled
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed scale-95'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:scale-110 active:scale-100'
              }`}
              disabled={isSubmitDisabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          
          {/* STATUS INDICATORS */}
          {!hasEnoughCoins && coinsChecked && (
            <div className="text-center mt-2">
              <p className="text-xs text-red-600 dark:text-red-400">
                🪙 Need {LIMITS.COINS_PER_FEATURE} coin to start career discovery
              </p>
            </div>
          )}
          
          {warningCount > 0 && !conversationBlocked && hasEnoughCoins && (
            <div className="text-center mt-2">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ {warningCount} warning{warningCount > 1 ? 's' : ''} - Please provide relevant responses
              </p>
            </div>
          )}
          
          {conversationBlocked && (
            <div className="text-center mt-2">
              <p className="text-xs text-red-600 dark:text-red-400">
                🛑 Session terminated - Use restart button above to continue
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
